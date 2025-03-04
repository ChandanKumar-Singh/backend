/**
 * Created by Dev on 28 Dec 2024.
 */

import jwt from "jsonwebtoken";
import Constants from "../config/constants.js";
import ResponseCodes from "../config/ResponseCodes.js";
import resConv from "../utils/resConv.js";
import { logg } from "../utils/logger.js";
import httpStatus from 'http-status'

const { sessionSecret } = Constants.security;

/**
 * Extracts and verifies JWT token from the request headers.
 * @param {string} token - The JWT token from authorization header.
 * @returns {Promise<object>} - Resolves with decoded user data or rejects with an error.
 */
const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, sessionSecret, (err, decoded) => {
      if (err || !decoded) {
        logg("JWT Verification Failed:", err?.message || "Invalid Token");
        return reject({ message: ResponseCodes.ERROR.INVALID_TOKEN, error: err });
      }
      resolve(decoded);
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
    logg("Authorization Header:", authorization);

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(httpStatus.UNAUTHORIZED).json(resConv(null, ResponseCodes.ERROR.UNAUTHORIZED_ACCESS, 0, new Error().stack));
    }

    const token = authorization.split(" ")[1];
    req.user = await verifyToken(token);
    req.sender = Constants.roles.userRoles[role] || "UNKNOWN_ROLE";

    logg(`User Authenticated: Role=${req.sender}, ID=${req.user?.id || "N/A"}`);
    next();
  } catch (error) {
    return res.status(httpStatus.UNAUTHORIZED).json(resConv(error.error, error.message, 0, new Error().stack));
  }
};

// Export specific middlewares for different roles
export const AdminMiddleware = authenticate(Constants.roles.userRoles.ADMIN);
export const UserMiddleware = authenticate(Constants.roles.userRoles.USER);
