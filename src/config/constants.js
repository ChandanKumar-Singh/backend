import dotenv from 'dotenv';
dotenv.config();

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
        }
    }
}

export default Constants;