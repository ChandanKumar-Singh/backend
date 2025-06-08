import UserModel from "../models/UserModel.js"; // Adjust as needed
import Constants from "../config/constants.js";
import DateUtils from "../utils/DateUtils.js";
import { mObj, mongoOne, setUserImage } from "../lib/mongoose.utils.js";
import { infoLog, logg, logger, LogUtils } from "../utils/logger.js";
import httpStatus from "http-status";
import AuthenticateDBO from "./AuthenticateDBO.js";
import FileUploadUtils from "../utils/FileUpload.utils.js";
import EventService from "../services/EventService.js";
import { Redis } from "../services/RedisService.js";
import { name } from "ejs";
import NotificationService from "../services/notification_service/NotificationService.js";
import {
  NotificationCategory,
  NotificationCodes,
  NotificationPriority,
  NotificationSource,
  NotificationType,
} from "../config/NotificationEnums.js";
import ApiError from "../middlewares/ApiError.js";
import NotificationMessages from "../config/notificationMessages.js";
import ResponseCodes from "../config/ResponseCodes.js";
import QueryUtils from "../lib/QueryUtils.js";
import RedisKeys from "../lib/RedisKeys.js";
import { getCountryContact } from "../utils/UrlsUtils.js";

class UserDBO {
  constructor() {
    EventService.on(Constants.EVENT.USER_UPDATE, ({ userId }) => {
      infoLog("UserDBO Event:", "USER_UPDATE", userId);
      userId && this.purgeCache(userId);
    });
  }

  /**
   * Fetch users with deep aggregation and flexible filters.
   * @param {Array} query - Initial query filters (e.g., match conditions)
   * @param {Array} midQuery - Additional query filters (e.g., date range, access control)
   * @param {Object} project - Fields to include/exclude in response
   * @returns {Promise<Array>} - Returns formatted user data
   */
  async fetchUsers({
    query = [],
    midQuery = [],
    project = {},
    timezone = Constants.TIME_ZONE_NAME,
    session = null,
    paginate = false,
    countOnly = false,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = -1,
    sort,
  } = {}) {
    try {
      // logg('fetchUsers:', JSON.stringify(query, null, 2), { midQuery, project, timezone, paginate, page, limit, sortBy, sortOrder, sort });
      const skip = (page - 1) * limit;

      const pipeline = [
        ...query,
        ...midQuery,
        {
          $lookup: {
            from: "addresses",
            localField: "address_id",
            foreignField: "_id",
            as: "addressObj",
          },
        },
        { $unwind: { path: "$addressObj", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "companies",
            localField: "company_id",
            foreignField: "_id",
            as: "companyObj",
          },
        },
        { $unwind: { path: "$companyObj", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "notificationpreferences",
            localField: "_id",
            foreignField: "user",
            as: "notificationPreferences",
          },
        },
        {
          $unwind: {
            path: "$notificationPreferences",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            fullName: {
              $trim: {
                input: {
                  $concat: [
                    { $ifNull: ["$name", ""] },
                    " ",
                    { $ifNull: ["$lastName", ""] },
                  ],
                },
              },
            },
            ageGroup: {
              $switch: {
                branches: [
                  { case: { $lt: ["$age", 18] }, then: "Minor" },
                  { case: { $lt: ["$age", 40] }, then: "Adult" },
                  { case: { $gte: ["$age", 40] }, then: "Senior" },
                ],
                default: "Unknown",
              },
            },
            isActive: { $eq: ["$status", "active"] },
            approvedOnText: DateUtils.aggregate("$approved_on", { timezone }),
            createdAtText: DateUtils.aggregate("$createdAt", { timezone }),
            updatedAtText: DateUtils.aggregate("$updatedAt", { timezone }),
            is_flagged: false,
          },
        },
      ];

      // Fetch total count separately for pagination metadata
      // const filter = query.length > 0 ? query[0].$match : {};
      // Extract all `$match` conditions into a single object
      const countFilter = pipeline
        .filter((stage) => stage.$match) // Get only $match stages
        .map((stage) => stage.$match) // Extract $match contents
        .reduce(
          (acc, match) => ({
            // Merge them together
            $and: [...(acc.$and || []), ...(match.$and || [match])],
          }),
          {}
        );
      const total = await UserModel.countDocuments(countFilter).session(
        session
      );
      if (countOnly) return { total };

      // Add sorting, pagination, and projection
      pipeline.push(
        { $sort: sort || { [sortBy]: sortOrder } },
        { $skip: skip },
        { $limit: limit },
        setUserImage("image"),
        {
          $project: {
            name: 1,
            lastName: 1,
            fullName: 1,
            email: 1,
            contact: 1,
            role: 1,
            type: 1,
            image: 1,
            age: 1,
            ageGroup: 1,
            gender: 1,
            fcmToken: 1,
            deviceId: 1,
            address: {
              street: "$addressObj.street",
              city: "$addressObj.city",
              state: "$addressObj.state",
              zip: "$addressObj.zip",
            },
            company: {
              name: "$companyObj.name",
              code: "$companyObj.code",
              industry: "$companyObj.industry",
            },
            notification_preferences: {
              _id: "$notificationPreferences._id",
              user: {
                _id: "$_id",
                email: "$email",
                name: "$name",
                role: "$role",
                type: "$type",
                status: "$status",
                isActive: "$isActive",
                image: "$image",
                contact: "$contact",
                country_code: "$country_code",
              },
              preferences: "$notificationPreferences.preferences",
              deliveryChannels: "$notificationPreferences.deliveryChannels",
            },
            status: 1,
            isActive: 1,
            last_login: 1,
            createdAt: 1,
            updatedAt: 1,
            approvedOnText: 1,
            createdAtText: 1,
            updatedAtText: 1,
            ...project,
          },
        }
      );

      // Run aggregation
      const users = await UserModel.aggregate(pipeline).session(session);
      if (!paginate) return users;

      return {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        users,
      };
    } catch (error) {
      console.error("fetchUsers Error:", error);
      throw error;
    }
  }

  getAllAdmins = async (q) => {
    return await this.fetchUsers({
      query: [{ $match: { type: Constants.roles.type.ADMIN } }],
      paginate: true,
      limit: 20,
    });
  };

  getById = async (id, { session = null, shouldForce = false } = {}) => {
    const redisData = await Redis.hget(...RedisKeys.USER_DETAILS(id));
    if (redisData && !shouldForce) {
      return redisData;
    } else {
      const obj = mongoOne(
        await this.fetchUsers({
          query: [{ $match: { _id: mObj(id) } }],
          session,
        })
      );
      if (obj) {
        Redis.hset(...RedisKeys.USER_DETAILS(id), obj);
        return obj;
      }
      return null;
    }
  };

  getList = async (data = {}, { session = null } = {}) => {
    let builder = QueryUtils.buildQuery(data, [], ["name", "email", "contact"]);
    builder.query = [
      { $match: { type: Constants.roles.type.USER } },
      ...builder.query,
    ];
    return await this.fetchUsers({ ...builder, session, paginate: true });
  };

  getUserCount = async (data = {}, { session = null } = {}) => {
    let builder = QueryUtils.buildQuery(data, [], ["name", "email", "contact"]);
    builder.query = [
      { $match: { type: Constants.roles.type.USER } },
      ...builder.query,
    ];
    return await this.fetchUsers({ ...builder, session, countOnly: true });
  };

  create = async (data, { session }) => {
    const { image, name, email, contact, fcmToken } = data;
    const user = new UserModel({
      image,
      name,
      email,
      contact,
      fcmToken,
    });
    await user.save({ session });
    EventService.emit(Constants.EVENT.USER_UPDATE, { userId: user._id });
    return await this.getById(user._id, { session });
  };

  update = async (data, { session, sendMail = false, sendOtp = false }) => {
    const { id, image, name, email, contact, fcmToken, deviceId } = data;
    const user = await UserModel.findById(mObj(id)).session(session);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    if (image) {
      if (user.image && user.image !== Constants.paths.DEFAULT_USER_IMAGE) {
        FileUploadUtils.deleteFiles([user.image], "User Image Update");
      }
      user.image = image;
    }
    if (name) user.name = name;
    if (email) {
      user.email = email;
      if (sendMail) {
        AuthenticateDBO.sendMail(
          email,
          user.type === Constants.roles.type.ADMIN,
          { session }
        );
        return { message: ResponseCodes.SUCCESS_MESSAGES.EMAIL_OTP_SENT };
      }
    }
    if (contact) {
      const { phone, country_code } = getCountryContact(contact);
      user.contact = phone;
      user.country_code = country_code;
      if (sendOtp)
        return await AuthenticateDBO.sendOtp(
          phone,
          user.type === Constants.roles.type.ADMIN,
          { session }
        );
    }
    if (fcmToken) user.fcmToken = fcmToken;
    if (deviceId) user.deviceId = deviceId;
    if (data.status) user.status = data.status;
    await user.save({ session, new: true });
    EventService.emit(Constants.EVENT.USER_UPDATE, { userId: id });
    this.sendUserNotification(id, {
      title: NotificationMessages.USER_PROFILE.PROFILE_UPDATED.title,
      message: NotificationMessages.USER_PROFILE.PROFILE_UPDATED.message,
      code: NotificationCodes.USER_UPDATED,
      data: { user: user._id },
    });
    return await this.getById(mObj(id), { session });
  };

  purgeCache = async (userId) => {
    if (!userId) return;
    /* const usersData = await this.getById(userId);
            if (usersData) {
             /// user data basis dispatches
            } */
    await Redis.hdel(...RedisKeys.USER_DETAILS(userId));
  };

  sendUserNotification = async (userId, payload) => {
    if (!userId) {
      logger.warn(
        "UserDBO -> sendUserNotification -> Invalid User ID:",
        userId
      );
      return null;
    }
    const notificationData = {
      user: userId,
      source: payload.source || NotificationSource.SYSTEM_ALERT,
      category: payload.category || NotificationCategory.SYSTEM,
      type: payload.type || NotificationType.SYSTEM,
      title: payload.title || "New Notification",
      message: payload.message || "You have a new notification",
      code: payload.code || NotificationCodes.NOTIFICATION,
      data: payload.data || {},
      url: payload.url || null,
      priority: payload.priority || NotificationPriority.NORMAL,
    };
    return await NotificationService.sendNotificationToUser(notificationData);
  };
}

export default new UserDBO();
