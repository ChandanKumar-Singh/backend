/**
 * Created by Dev on 28 Dec 2024.
 */

import jwt from "jsonwebtoken";
import Constants from "../config/constants.js";
import ResponseCodes from "../config/ResponseCodes.js";
import resConv from "../utils/resConv.js";
import { logg } from "../utils/logger.js";

const sessionSecret = Constants.security.sessionSecret;

/**
 * Common middleware for authentication based on role
 * @param {string} role - Role to authenticate (e.g., "ADMIN", "USER")
 */
const authenticate = (role) => (req, res, next) => {
  const { authorization } = req.headers;
  logg("Authorization:", authorization);

  const response = {
    code: 401,
    message: ResponseCodes.ERROR.UNAUTHORIZED_ACCESS,
    data: null
  };

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json(resConv(...response));
  }

  const token = authorization.split(" ")[1];

  jwt.verify(token, sessionSecret, async (err, decoded) => {
    if (err || !decoded) {
      response.message = ResponseCodes.ERROR.INVALID_TOKEN;
      response.data = err;
      return res.status(401).json(resConv(...response));
    }
    req.user = decoded;
    req.sender = Constants.roles.userRoles[role] || "UNKNOWN_ROLE";
    next();
  });
};

// Export specific middlewares for different roles
export const AdminMiddleware = authenticate(Constants.roles.userRoles.ADMIN);
export const UserMiddleware = authenticate(Constants.roles.userRoles.USER);
