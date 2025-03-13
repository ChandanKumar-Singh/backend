import UserModel from '../models/UserModel.js'; // Adjust as needed
import Constants from '../config/constants.js';
import DateUtils from '../utils/DateUtils.js';
import { mObj, mongoOne } from '../lib/mongoose.utils.js';
import { infoLog, logg } from '../utils/logger.js';
import httpStatus from 'http-status';
import AuthenticateDBO from './AuthenticateDBO.js';
import FileUploadUtils from '../utils/FileUpload.utils.js';
import EventService from '../services/EventService.js';
import RedisService from '../services/RedisService.js';
import { name } from 'ejs';

class UserDBO {
    constructor() {
        EventService.on(Constants.Events.USER_UPDATE, ({ userId }) => {
            infoLog('UserDBO Event:', 'USER_UPDATE', userId);
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
        page = 1,
        limit = 20,
        sortBy = "createdAt",
        sortOrder = -1,
    } = {}) {
        try {
            const skip = (page - 1) * limit;

            const pipeline = [
                ...query,
                ...midQuery,
                {
                    $lookup: {
                        from: 'addresses',
                        localField: 'address_id',
                        foreignField: '_id',
                        as: 'addressObj',
                    },
                },
                { $unwind: { path: '$addressObj', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'companies',
                        localField: 'company_id',
                        foreignField: '_id',
                        as: 'companyObj',
                    },
                },
                { $unwind: { path: '$companyObj', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'preferences',
                        localField: '_id',
                        foreignField: 'user_id',
                        as: 'preferences',
                    },
                },
                {
                    $addFields: {
                        fullName: { $concat: ['$firstName', ' ', '$lastName'] },
                        ageGroup: {
                            $switch: {
                                branches: [
                                    { case: { $lt: ['$age', 18] }, then: 'Minor' },
                                    { case: { $lt: ['$age', 40] }, then: 'Adult' },
                                    { case: { $gte: ['$age', 40] }, then: 'Senior' },
                                ],
                                default: 'Unknown',
                            },
                        },
                        isActive: { $eq: ['$status', 'active'] },
                        approvedOnText: DateUtils.aggregate("$approved_on", { timezone }),
                        createdAtText: DateUtils.aggregate("$createdAt", { timezone }),
                        updatedAtText: DateUtils.aggregate("$updatedAt", { timezone }),
                        is_flagged: false,
                    },
                }
            ];

            // Add sorting, pagination, and projection
            pipeline.push(
                { $sort: { [sortBy]: sortOrder } }, // Sorting
                { $skip: skip }, // Pagination - Skip items
                { $limit: limit }, // Pagination - Limit items
                {
                    $project: {
                        name: 1,
                        firstName: 1,
                        lastName: 1,
                        fullName: 1,
                        email: 1,
                        contact: 1,
                        role: 1,
                        type: 1,
                        profilePicture: {
                            $concat: [
                                Constants.path.public_url,
                                { $ifNull: ['$image', Constants.path.DEFAULT_USER_IMAGE] },
                            ],
                        },
                        age: 1,
                        ageGroup: 1,
                        gender: 1,
                        fcmToken: 1,
                        deviceId: 1,
                        address: {
                            street: '$addressObj.street',
                            city: '$addressObj.city',
                            state: '$addressObj.state',
                            zip: '$addressObj.zip',
                        },
                        company: {
                            name: '$companyObj.name',
                            code: '$companyObj.code',
                            industry: '$companyObj.industry',
                        },
                        preferences: {
                            $map: {
                                input: '$preferences',
                                as: 'preference',
                                in: {
                                    key: '$$preference.key',
                                    value: '$$preference.value',
                                },
                            },
                        },
                        status: 1,
                        isActive: 1,
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


            // Fetch total count separately for pagination metadata
            const total = await UserModel.countDocuments(query).session(session);

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
        return await this.fetchUsers({ query: [{ $match: { type: Constants.roles.userRoles.ADMIN } }], paginate: true, limit: 20 });
    }

    getById = async (id, { session = null, shouldForce = false } = {}) => {
        const redisKey = Constants.RedisKeys.USER_DETAILS;
        const redisData = await RedisService.hget(redisKey, id);
        if (redisData && !shouldForce) {
            return redisData;
        } else {
            const obj = mongoOne(
                await this.fetchUsers({ query: [{ $match: { _id: mObj(id) } }], session })
            );
            if (obj) {
                RedisService.hset(redisKey, id, obj);
                return obj;
            }
            return null;
        }
    };

    getList = async ({ query, session = null }) => {
        return await this.fetchUsers({ query: [], session, paginate: true });
    }

    update = async (data, { session, sendMail = false, sendOtp = false }) => {
        const {
            id,
            image,
            name,
            email,
            contact,
            fcmToken,
            deviceId,
        } = data;
        const user = await UserModel.findById(mObj(id)).session(session);
        if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
        if (image) {
            if (user.image && user.image !== Constants.path.DEFAULT_USER_IMAGE) {
                FileUploadUtils.deleteFiles([user.image], 'User Image Update');
            }
            user.image = image;
        }
        if (name) user.name = name;
        if (email) {
            user.email = email;
            // if (sendMail) AuthenticateDBO.sendMail(email, user.type === Constants.roles.userRoles.ADMIN, { session });
        }
        if (contact) {
            const { contact, country_code } = getCountryContact(contact);
            user.contact = contact;
            user.country_code = country_code;
            if (sendOtp) AuthenticateDBO.sendOtp(contact, user.type === Constants.roles.userRoles.ADMIN, { session });
        }
        if (fcmToken) user.fcmToken = fcmToken;
        if (deviceId) user.deviceId = deviceId;
        if (data.status) user.status = data.status;
        await user.save({ session, new: true });
        EventService.emit(Constants.Events.USER_UPDATE, { userId: id });
        return await this.getById(mObj(id), { session });
    }

    purgeCache = async (userId) => {
        if (!userId) return;
        /* const usersData = await this.getById(userId);
        if (usersData) {
         /// user data basis dispatches
        } */
        await RedisService.hdel(
            Constants.RedisKeys.USER_DETAILS,
            userId.toString()
        );
    };
}

export default new UserDBO();
