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
        test: process.env.NODE_ENV === 'test' || 'local',
        local: process.env.NODE_ENV === 'local',
        development: process.env.NODE_ENV === 'development' || 'local',
        production: process.env.NODE_ENV === 'production' || 'local',
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
        }
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
    TIME_ZONE: process.env.TIME_ZONE || 5.5,
    TIME_ZONE_NAME: process.env.TIME_ZONE_NAME || 'UTC',
    DATE_TIME_FORMAT: '%Y-%m-%d | %H:%M',
    DATE_FORMAT: '%Y-%m-%d',
    TIME_FORMAT: '%H:%M:%S',
    path: {
        root: path.normalize(__dirname + '/..'),
        root_public: path.normalize(__dirname + '/..') + '/public/',
        public_url: process.env.URL + '/public/',
        DEFAULT_USER_IMAGE: 'default_user_image.jpg',
        DEFAULT_USER_IMAGE_PATH: 'user_images/'
    }
}

export default Constants;