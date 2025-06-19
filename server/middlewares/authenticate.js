/**
 * Created by Dev on 28 Dec 2024.
 */

import jwt from "jsonwebtoken";
import Constants from "../config/constants.js";
import ResponseCodes from "../config/ResponseCodes.js";
import resConv from "../utils/resConv.js";
import { logg, warnLog } from "../utils/logger.js";
import httpStatus from "http-status";
import { Redis } from "../services/RedisService.js";
import ApiError from "./ApiError.js";
import RedisKeys from "../lib/RedisKeys.js";

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
        logg(`❌ JWT Verification Failed: \n ${token}`, err?.message || "Invalid Token");
        return reject(new ApiError(httpStatus.UNAUTHORIZED, ResponseCodes.ERROR.INVALID_TOKEN, true, null, 0, err, 'SESSION_EXPIRED'));
      }
      // logg("✅ JWT Decoded:", decoded);

      try {
        req.user = decoded;
        req.sender_id = decoded.id;

        if (Constants.Redis.Enabled === true) {
          // logg("🔍 Fetching Redis Data:", Constants.Redis.Enabled);
          const data = await Redis.hget(...RedisKeys.AuthKey(role, decoded.id));
          const decodedData = data;
          // warnLog("Decoded JWT:", decoded, role , data);
          // warnLog("Decoded Redis Data:", decodedData);
          if (!decodedData || decodedData.id !== decoded.id) {
            return reject(new ApiError(httpStatus.UNAUTHORIZED, ResponseCodes.AUTH_ERRORS.SESSION_EXPIRED, true, null, 0, err, 'SESSION_EXPIRED'));
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
    if (!Constants.envs.production) logg("🔐 Authorization Header:", authorization);
    const isAuthOptional = req.optionalAuth || false;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      if (isAuthOptional) {
        next();
        return;
      }
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json(resConv(null, { message: ResponseCodes.AUTH_ERRORS.UNAUTHORIZED_ACCESS, code: 0, stackTrace: new Error().stack, errorCode: "AUTH_MISSING_TOKEN" }));
    }

    const token = authorization.split(" ")[1];
    await verifyToken(token, req, role);

    req.sender = Constants.roles.type[role] || "UNKNOWN_ROLE";
    // if (!Constants.envs.production) logg(`✅ User Authenticated: Role=${req.sender}, ID=${req.user?.id || "N/A"}`);
    next();
  } catch (error) {
    return res
      .status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR)
      .json(resConv(error, { message: error.message, code: 0, stackTrace: new Error().stack, errorCode: error.errorCode }));
  }
};

/**
 * Middleware for optional authentication.
 * If no token is provided, it allows the request to proceed without authentication.
 */

const optionalAuthenticate = async (req, res, next) => {
  req.optionalAuth = true;
  next();
}

// Export specific middlewares for different roles
export const AdminMiddleware = authenticate(Constants.roles.type.ADMIN);
export const UserMiddleware = authenticate(Constants.roles.type.USER);
export const AuthOptionalMiddleware = optionalAuthenticate;
