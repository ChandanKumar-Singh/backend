/**
 * Created by Dev on 28 Dec 2024.
 */

import jwt from "jsonwebtoken";
import Constants from "../config/constants.js";
import ResponseCodes from "../config/ResponseCodes.js";
import resConv from "../utils/resConv.js";
import { logg, warnLog } from "../utils/logger.js";
import httpStatus from "http-status";
import RedisService from "../services/RedisService.js";
import ApiError from "./ApiError.js";

const { sessionSecret } = Constants.security;

/**
 * Extracts and verifies JWT token from the request headers.
 * @param {string} token - The JWT token from authorization header.
 * @param {object} req - The Express request object.
 * @param {string} role - The user role (ADMIN or USER).
 * @returns {Promise<object>} - Resolves with decoded user data or rejects with an error.
 */
const verifyToken = (token, req, role) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, sessionSecret, async (err, decoded) => {
      if (err || !decoded) {
        logg("❌ JWT Verification Failed:", err?.message || "Invalid Token");
        return reject(new ApiError(httpStatus.UNAUTHORIZED, ResponseCodes.ERROR.INVALID_TOKEN, true, null, 0, err));
      }

      try {
        const redisKey =
          role === Constants.roles.userRoles.ADMIN
            ? Constants.RedisKeys.ADMIN_AUTH
            : Constants.RedisKeys.USER_AUTH;
        req.user = decoded;
        req.sender_id = decoded.id;

        if (Constants.Redis.Enabled === true) {
          logg("🔍 Fetching Redis Data:", Constants.Redis.Enabled);
          const data = await RedisService.hget(redisKey, decoded.id);
          const decodedData = data;
          warnLog("Decoded JWT:", decoded, role);
          warnLog("Decoded Redis Data:", decodedData);
          if (!decodedData || decodedData.uniquekey !== decoded.uniquekey) {
            return reject(new ApiError(httpStatus.UNAUTHORIZED, ResponseCodes.ERROR.SESSION_EXPIRED, true, null, 0, err));
          }
          req.user = decodedData;
        }

        // Attach user data to request
        req.sender = role;
        req.currency = req.currency || Constants.BASE_CURRENCY;
        resolve(decoded);
      } catch (error) {
        logg("❌ Authentication Redis Error:", error);
        reject(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, ResponseCodes.ERROR.SERVER_ERROR, true, null, 0, error));
      }
    });
  });
};

/**
 * Middleware for authentication based on user role.
 * @param {string} role - Role to authenticate (e.g., "ADMIN", "USER").
 */
const authenticate = (role) => async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    logg("🔐 Authorization Header:", authorization);

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json(resConv(null, ResponseCodes.ERROR.UNAUTHORIZED_ACCESS, 0, new Error().stack));
    }

    const token = authorization.split(" ")[1];
    await verifyToken(token, req, role);

    req.sender = Constants.roles.userRoles[role] || "UNKNOWN_ROLE";
    logg(`✅ User Authenticated: Role=${req.sender}, ID=${req.user?.id || "N/A"}`);
    next();
  } catch (error) {
    return res
      .status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR)
      .json(resConv(error.message, error.message, 0, new Error().stack));
  }
};

// Export specific middlewares for different roles
export const AdminMiddleware = authenticate(Constants.roles.userRoles.ADMIN);
export const UserMiddleware = authenticate(Constants.roles.userRoles.USER);
