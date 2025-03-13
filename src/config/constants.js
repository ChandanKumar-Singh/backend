import dotenv from 'dotenv';
dotenv.config();
import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const Constants = {
    db: {
        mongo: {
            uri: process.env.MONGO_URI,
        }
    },
    envs: {
        test: process.env.NODE_ENV === 'test',
        local: process.env.NODE_ENV === 'local',
        development: process.env.NODE_ENV === 'development',
        production: process.env.NODE_ENV === 'production',
    },
    routes: {
        view: '/',
        api: '/api',
        admin: '/admin'
    },
    security: {
        sessionSecret:
            process.env.Secret_access_key ||
            'base64:Olvke97cjrcZg4ZYv2nlXxHTLNIs2XWFw9oVuH/OH5E=',
        sessionExpiration: process.env.SESSION_EXPIRATION || 60 * 60 * 24 * 365, // 1 week
        saltRounds: process.env.SALT_ROUNDS || 12,
    },
    roles: {
        userRoles: {
            ADMIN: 'ADMIN',
            USER: 'USER',
            MEMBER: 'MEMBER',
            PARTICIPANT: 'PARTICIPANT',
        },
        adminRole: {
            GENERAL: 'GENERAL',
            CHAPTER_ADMIN: 'CHAPTER_ADMIN',
        },
        role: {
            OWNER: 'OWNER',
            SHOWROOM_MANAGER: 'SHOWROOM_MANAGER',
            OTHERS: 'OTHERS',
            CORPORATE_HR: 'CORPORATE_HR',

        },

    },
    USER_STATUS: {
        ACTIVE: 'ACTIVE',
        RESIGNED: 'RESIGNED',
        TERMINATED: 'TERMINATED',
        RETIRED: 'RETIRED',
        EXPIRED: 'EXPIRED',
        ABSCONDED: 'ABSCONDED',
        INACTIVE: 'INACTIVE',
        SUSPENDED: 'SUSPENDED',
        DELETED: 'DELETED',
    },

    pageStatus: {
        DRAFT: 'draft',
        PUBLISHED: 'published',
        INACTIVE: 'inactive',
    },
    TIME_ZONE: process.env.TIME_ZONE || 5.5,
    TIME_ZONE_NAME: process.env.TIME_ZONE_NAME || 'UTC',
    DATE_TIME_FORMAT: '%Y-%m-%d | %H:%M',
    DATE_FORMAT: '%Y-%m-%d',
    TIME_FORMAT: '%H:%M:%S',
    path: {
        root: path.normalize(__dirname + '/..'),
        root_public: path.normalize(__dirname + '/..') + '/public/',
        publicKey: 'public',
        public_url: process.env.URL + '/public/',
        DEFAULT_USER_IMAGE: 'default_user_image.jpg',
        DEFAULT_USER_IMAGE_PATH: 'user_images/'
    },

    Device: {
        os: {
            WINDOWS: 'Windows',
            MACOS: 'macOS',
            LINUX: 'Linux',
            IOS: 'iOS',
            ANDROID: 'Android',
        },
        deviceType: {
            DESKTOP: 'desktop',
            MOBILE: 'mobile',
            TABLET: 'tablet',
            UNKNOWN: 'unknown',
        }
    },

    Redis: {
        Enabled: process.env.REDIS_ENABLED == 'true' || false,
        Host: process.env.REDIS_HOST || 'localhost',
        Port: process.env.REDIS_PORT || 6379,
        Password: process.env.REDIS_PASSWORD || '',
        KEY: process.env.REDIS_KEY || 'TRIDGE_'
    },

    RedisKeys: {
        ADMIN_AUTH: 'ADMIN_AUTH',
        USER_AUTH: 'USER_AUTH',
        USER_DETAILS: 'USER_DETAILS',
    },

    Events: {
        Enabled: process.env.EVENT_ENABLED == 'true' || false,
        USER_UPDATE: 'USER_UPDATE',
    },


}

export default Constants;