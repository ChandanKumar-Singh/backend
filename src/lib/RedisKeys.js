import Constants from "../config/constants.js";
import { logg } from "../utils/logger.js";

const Redis = Constants.REDIS_KEYS;

const RedisKeys = {
    AuthKey: (role, id) => [
        role === Constants.roles.accessLevels.ADMIN
            ? Redis.ADMIN_AUTH
            : Redis.USER_AUTH,
        id,
    ],

    AdminAuth: (id) => [Redis.ADMIN_AUTH, id],

    UserAuth: (id) => [Redis.USER_AUTH, id],
    USER_DETAILS: (id) => [Redis.USER_DETAILS, id],
    TICKET_DETAILS: (id) => [Redis.TICKET_DETAILS, id],
    TICKET_REPLY_DETAILS: (id) => [Redis.TICKET_REPLY_DETAILS, id],

    // Notification Keys
    NOTIFICATION_PREFERENCE: (id) => [Redis.NOTIFICATION_PREFERENCE, id],
};

export default RedisKeys;
