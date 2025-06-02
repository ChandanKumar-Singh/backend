import Constants from "../config/constants.js";
import ApiError from "../middlewares/ApiError.js";
import httpStatus from "http-status";
import UserDBO from "./UserDBO.js";
import { getCountryContact } from "../utils/UrlsUtils.js";
import fs, { stat } from "fs";
import mongoose from "mongoose";
import { mObj, mongoOne } from "../lib/mongoose.utils.js";
import UserModel from "../models/UserModel.js";
import ResponseCodes from "../config/ResponseCodes.js";
import AuthenticateUtils from "../lib/AuthenticateUtils.js";
import { logg } from "../utils/logger.js";
import { generateVerificationCode, isEmail, isValidEmail } from "../utils/Helper.utils.js";
import RolesUtil from "../lib/RolesUtil.js";
import RedisService from "../services/RedisService.js";
import DeviceInfo from "../models/core/DeviceInfo.js";
import NotificationPreferenceDBO from "./notification/NotificationPreferenceDBO.js";
import EmailService from "../services/EmailService.js";
import RedisKeys from "../lib/RedisKeys.js";

class AuthenticateDBO {
  getUser = async (contactPr, isAdmin = false, { email = null, session = null } = {}) => {
    if (contactPr) {
      let query = {};
      if (contactPr.includes("@" || email)) {
        query = { email: email || contactPr };
      } else {
        const { contact, country_code } = getCountryContact(contactPr);
        query = { country_code, contact };
      }
      if (isAdmin) {
        query["type"] = Constants.roles.type.ADMIN;
      } else {
        query["$or"] = [
          {
            type: { $in: Object.values(Constants.roles.type) },
          },
        ];
      }
      return mongoOne(await UserModel.find({ ...query }).session(session));
    }
    return null;
  };

  getUserByUniqueKey = async (uniqueKeys = [], isAdmin = false, { session = null } = {}) => {
    let query = {};
    if (isAdmin) {
      query["type"] = Constants.roles.type.ADMIN;
    } else {
      query["$or"] = [
        {
          type: { $in: Object.values(Constants.roles.type) },
        },
      ];
    }
    query["$or"] = uniqueKeys.map((key) => {
      return { [key]: uniqueKeys[key] };
    });
    return mongoOne(await UserModel.find({ ...query }).session(session));
  };

  processAdminAuthentication = async (tempAuth, { session }) => {
    const uniqueKey = AuthenticateUtils.makeid();
    const token = tempAuth.generateToken(uniqueKey);
    const userDetails = await UserDBO.getById(tempAuth._id, {
      session: session,
    });
    await RedisService.hset(
      ...RedisKeys.AdminAuth(tempAuth._id),
      {
        uniquekey: uniqueKey,
        role: tempAuth.role,
        type: tempAuth.type,
        id: tempAuth._id,
      },
      60 * 60 * 24 * 360
    );
    return {
      token: token,
      user_id: tempAuth._id,
      type: tempAuth.type,
      ...userDetails,
    };
  };

  processAppAuthentication = async (tempAuth, { session }) => {
    const uniqueKey = AuthenticateUtils.makeid();
    const token = tempAuth.generateToken(uniqueKey);
    const userDetails = await UserDBO.getById(tempAuth._id, {
      session: session,
    });

    await RedisService.hset(
      ...RedisKeys.UserAuth(tempAuth._id),
      {
        uniquekey: uniqueKey,
        role: tempAuth.role,
        type: tempAuth.type,
        id: tempAuth._id,
      },
      60 * 60 * 24 * 360
    );
    return {
      token: token,
      user_id: tempAuth._id,
      role: tempAuth.role,
      type: tempAuth.type,
      ...userDetails,
    };
  };

  adminLoginViaPassword = async (contact, password, isAdmin = false) => {
    const tempAuth = await this.getUser(contact, isAdmin);

    if (tempAuth && tempAuth.status !== Constants.EMPLOYEE_STATUS.ACTIVE) {
      throw new ApiError(httpStatus.NOT_FOUND, "User Suspended");
    }
    if (!tempAuth) {
      throw new ApiError(httpStatus.NOT_FOUND, "Account not found");
    }

    if (!tempAuth.password || !tempAuth.authenticate(password)) {
      const err = new ApiError(
        httpStatus.BAD_REQUEST,
        "Invalid credentials! Please verify."
      );
      throw err;
    }

    tempAuth.last_login = new Date();
    tempAuth.save().then(() => { });
    if (isAdmin) {
      return await this.processAdminAuthentication(tempAuth);
    } else {
      return await this.processAppAuthentication(tempAuth);
    }
  };

  createAdmin = async (req, { session = null } = {}) => {
    const { contact, country_code, password, name, email, role, type } = req;
    const tempAuth = await this.getUser(country_code + " " + contact, true, {
      session: session,
    });
    if (tempAuth)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        ResponseCodes.USER_ERRORS.ACCOUNT_ALREADY_EXISTS(contact)
      );
    let user = new UserModel({
      contact,
      country_code,
      password,
      name,
      email,
      role,
      type,
      status: Constants.USER_STATUS.ACTIVE,
    });
    await user.save({ session });
    return await this.processAdminAuthentication(user, { session: session });
  };

  createUser = async (req, { session = null, processAuth = true } = {}) => {
    const { contact, country_code, password, name, email, role, type } = req;
    const tempAuth = await this.getUser(country_code + " " + contact, false, {
      session: session
    });
    if (tempAuth)
      throw new ApiError(
        httpStatus.CONFLICT,
        ResponseCodes.USER_ERRORS.USER_ALREADY_EXISTS(contact)
      );

    let user = new UserModel({
      contact,
      country_code,
      password,
      name,
      email,
      role,
      type: Constants.roles.type.USER,
      status: Constants.USER_STATUS.ACTIVE,
    });
    user = await user.save({ session, new: true });
    await NotificationPreferenceDBO.createUserPreference(user._id, { session });
    if (processAuth) {
      return await this.processAppAuthentication(user, { session: session });
    } else {
      return await UserDBO.getById(user._id, { session: session });
    }
  }

  sendOtp = async (contact, isAdmin = false, { session }) => {
    const tempAuth = await this.getUser(contact, isAdmin, { session: session });
    if (tempAuth) {
      if (tempAuth.status !== Constants.USER_STATUS.ACTIVE) {
        throw new ApiError(httpStatus.NOT_FOUND, ResponseCodes.ACCOUNT.ACCOUNT_SUSPENDED);
      }
      const otp =
        tempAuth.contact === "8054212321" ? 777777 : generateVerificationCode();
      tempAuth.otp = otp;
      await tempAuth.save({ session });
      /*  EmailUtils.sendLoginOTPEmail(tempAuth.email, { otp });
       SmsUtils.sendOTP(
         tempAuth.name,
         `+${tempAuth.country_code} ${tempAuth.contact}`,
         otp
       ); */
      return {
        message:
          "A verification code has been sent to your registered mobile number/email",
      };
    }
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  };

  sendMail = async (email, subject, message) => {
    const mailOptions = {
      from: Constants.EMAIL_FROM,
      to: email,
      subject: subject,
      html: message,
    };
    EmailService.sendMail(mailOptions);
  };

  verifyOTP = async (
    contact,
    otp,
    { isAdmin = false, session = null } = {}
  ) => {
    const tempAuth = await this.getUser(contact, isAdmin, { session });
    if (!tempAuth) {
      throw new ApiError(httpStatus.NOT_FOUND, "Account not found");
    }
    if (tempAuth && tempAuth.status !== Constants.USER_STATUS.ACTIVE) {
      throw new ApiError(httpStatus.NOT_FOUND, "User Suspended");
    }
    if (
      !tempAuth
      /// TODO: Uncomment this condition for real
      // ||  tempAuth.otp !== otp
    ) {
      logg("otp", tempAuth?.otp, otp);
      const err = new ApiError(httpStatus.BAD_REQUEST, "Incorrect OTP Entered");
      throw err;
    }

    tempAuth.last_login = new Date();
    logg("tempAuth", tempAuth.last_login);
    tempAuth.otp = Date.now();
    await tempAuth.save({ session }).then(() => { });
    if (isAdmin) {
      return await this.processAdminAuthentication(tempAuth, { session });
    } else {
      return await this.processAppAuthentication(tempAuth, { session });
    }
  };

  login = async (data, { isAdmin = false, session = null } = {}) => {
    const { username, password } = data;
    logg("username", username);
    let tempAuth = await this.getUser(username, isAdmin);
    if (!tempAuth) throw new ApiError(httpStatus.NOT_FOUND, "Account not found");
    if (data.provider && data.provider === Constants.AUTH_PROVIDERS.PHONE) {
      var res = await this.sendOtp(
        username,
        isAdmin,
        { session: session }
      );
      return res;
    }
    if (!tempAuth.authenticate(password)) {
      const err = new ApiError(
        httpStatus.BAD_REQUEST,
        ResponseCodes.AUTH_ERRORS.INVALID_CREDENTIALS
      );
      throw err;
    }

    if (tempAuth && tempAuth.status !== Constants.USER_STATUS.ACTIVE) {
      throw new ApiError(httpStatus.BAD_REQUEST, ResponseCodes.ACCOUNT.ACCOUNT_SUSPENDED, true, "", -1);
    }

    tempAuth.last_login = new Date();
    tempAuth = await tempAuth.save({ session });
    if (isAdmin) {
      return await this.processAdminAuthentication(tempAuth, { session: session });
    }
    return await this.processAppAuthentication(tempAuth, { session: session });
  };

  getProfile = async (userId) => {
    const emp = await UserDBO.getById(userId);
    if (emp) {
      return {
        ...emp,
      };
    }
    return new ApiError(httpStatus.NOT_FOUND, "Employee not found");
  };

  logoutUser = async (userId) => {
    await RedisService.hdel(...RedisKeys.UserAuth(userId));
    DeviceInfo.updateMany({ userId: mObj(userId) }, { fcmToken: null });
    UserDBO.update({
      id: userId,
      fcmToken: null,
      deviceId: null,
    });
  };

  passwordVerify = async (userId, password) => {
    const tempAuth = mongoOne(await EmployeeModel.find({ _id: userId }));
    if (!tempAuth || !tempAuth.authenticate(password)) {
      return false;
    }
    return true;
  };

  changePassword = async (userId, currentPassword, password) => {
    const tempAuth = await mongoOne(await EmployeeModel.find({ _id: userId }));
    if (!tempAuth || !tempAuth.authenticate(currentPassword)) {
      throw new ApiError(httpStatus.NOT_FOUND, "Please Verify Password");
    }
    tempAuth.password = password;
    tempAuth.save().then(() => { });
    return true;
  };

  forgotPassword = async (code, { session = null } = {}) => {
    const user = await this.getUser(code);
    if (user) {
      user.generatePasswordReset();
      await user.save({ session })
      let email = user.email;
      let contact = user.country_code + " " + user.contact;
      if (email && isValidEmail(email)) {
        EmailService.sendForgotPasswordEmail(
          email,
          {
            name: user.name,
            resetPasswordToken: user.resetPasswordToken
          }
        );
      } else {
        if (contact && contact.length > 0) {
          return await this.sendOtp(contact, false, { session: session });
        } else {
          throw new ApiError(httpStatus.NOT_FOUND, "Recovey method not found");
        }
      }
    }
  }

  resetPassword = async (token, password, { session = null } = {}) => {
    const tempUser = mongoOne(
      await UserModel.find({
        // resetPasswordToken: token,
        contact: token,
        resetPasswordExpires: { $gt: Date.now() }
      }).session(session)
    );
    if (tempUser) {
      tempUser.password = password;
      tempUser.resetPasswordToken = undefined;
      tempUser.resetPasswordExpires = undefined;
      await tempUser.save({ session });
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, "Password reset token is invalid or has expired.");
    }
  };

  callMe = async (time) => {
    return await new Promise((res, rej) => {
      setTimeout(() => {
        LogUtils.log("time", time);
        res();
      }, time);
    });
  };

  sendWelcomeEmail = async () => {
    const employees = await EmployeeModel.find({
      status: Constants.EMPLOYEE_STATUS.ACTIVE,
    }).select({ name: 1, official_email: 1, personal_email: 1 });
    asyncForEach(employees, async (val) => {
      const email = EmployeeDBO.getEmployeeEmail({
        official_email: val.official_email,
        personal_email: val.personal_email,
      });
      if (email && isValidEmail(email)) {
        LogUtils.log("email", email, val.name);
        // await EmailUtils.sendWelcomEmailToEmployees(val.name, email);
        // await EmailUtils.sendWelcomEmailToEmployees('ashu', 'charanjeet@electrovese.com');
      }
    });
    await EmailUtils.sendWelcomEmailToEmployees(
      "ashu",
      "charanjeet@electrovese.com"
    );
  };

  completeProfile = async (req) => {
    const { email, password, image, city } = req.body;
    const userId = mObj(req.user.id);
    const user = mongoOne(await UserModel.find({ _id: userId }));
    if (user) {
      if (email) {
        user.email = email;
      }
      if (password) {
        user.password = password;
      }
      if (image) {
        user.image = image;
      }
      if (city) {
        user.city = city;
      }
      if (email && password) {
        user.is_profile_completed = true;
      }
      await user.save();
      return await UserDBO.getById(user._id);
    }
  };

  updateProfile = async (req) => {
    const { name, company_name, title, email, image, city } = req.body;
    const userId = mObj(req.user.id);
    const user = mongoOne(await UserModel.find({ _id: userId }));
    if (user) {
      if (image) user.image = image;
      user.name = name;
      user.company_name = company_name;
      user.title = title;
      user.city = city;
      user.email = email;
      await user.save();
      return await UserDBO.getById(user._id, true, { shouldForce: false });
    }
  };

  deleteProfile = async (userId) => {
    const user = mongoOne(await UserModel.find({ _id: mObj(userId) }));
    if (user) {
      user.status = Constants.USER_STATUS.DELETED;
      await user.save();
      await RedisService.hdel(...RedisKeys.UserAuth(userId));
      await DeviceInfo.updateMany({ userId: mObj(userId) }, { fcmToken: null });
      await UserDBO.update({
        id: userId,
        fcmToken: null,
        deviceId: null,
        status: Constants.USER_STATUS.DELETED,
      });
      return await UserDBO.getById(user._id);
    }
  };

  createQr = async (req) => {
    const { user_id } = req;
    qr.toFile(
      `app/public/user_qr/userQR_${user_id}.png`, // Specify the path to the public folder
      user_id,
      (err) => {
        if (err) throw err;
        console.log(`QR code for user ${user_id} saved in public folder.`);
      }
    );
  };

  captureInfo = async ({
    gcm_id,
    device_id,
    device_os,
    os_version,
    app_version,
    userId,
  }) => {
    const orQuery = [{ device_id: device_id }];
    if (userId) {
      orQuery.push({ user_id: userId });
    }
    const tempInfo = mongoOne(await CaptureInfoModel.find({ $or: orQuery }));
    if (tempInfo) {
      tempInfo.user_id = mObj(userId);
      tempInfo.device_id = device_id;
      tempInfo.gcm_id = gcm_id;
      tempInfo.device_os = device_os.toUpperCase();
      tempInfo.os_version = os_version;
      tempInfo.app_version = app_version;
      tempInfo.notification_count = 0;
      tempInfo.save();
    } else {
      const temp = new CaptureInfoModel({
        gcm_id: gcm_id,
        device_id: device_id,
        device_os: device_os.toUpperCase(),
        os_version: os_version,
        app_version: app_version,
        user_id: mObj(userId),
      });
      temp.save();
    }
  };

  getAllAdmins = async () => {
    return await UserModel.find({ type: Constants.roles.type.ADMIN });
  };

  deleteAllAdmins = async () => {
    return await UserModel.deleteMany({
      type: Constants.roles.type.ADMIN,
    });
  };

}

export default new AuthenticateDBO();
