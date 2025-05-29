import dotenv from 'dotenv';
dotenv.config();
import path from 'path';
import { dirname } from '../utils/PathUtils.js';


// Destructure environment variables for easy access
const {
    APP_NAME,
    APP_VERSION,
    APP_DESCRIPTION,
    APP_AUTHOR,
    API_BASE_PATH,
    MONGO_URI,
    NODE_ENV,
    SECRET_ACCESS_KEY,
    SESSION_EXPIRATION,
    SALT_ROUNDS,
    TIME_ZONE,
    TIME_ZONE_NAME,
    URL,
    PORT,
    REDIS_ENABLED,
    REDIS_HOST,
    REDIS_PORT,
    REDIS_PASSWORD,
    REDIS_KEY,
    EVENT_ENABLED,
    LOG_ENABLED,
    WARNING_ENABLED,
    ERROR_ENABLED,
} = process.env;

// App Details
const app = {
    name: APP_NAME || "NodeJS API",
    version: APP_VERSION || "1.0.0",
    description: APP_DESCRIPTION || "NodeJS API Description",
    author: APP_AUTHOR || "Author Name",
};

// Environment configurations
const envs = {
    test: NODE_ENV === "test",
    local: NODE_ENV === "local",
    development: NODE_ENV === "development",
    production: NODE_ENV === "production",
    isLive: NODE_ENV === "production" || NODE_ENV === "development", // ✅ Self-referencing
};

// Database configurations
const db = {
    mongo: { uri: MONGO_URI }
};

// routes configurations
const routes = {
    view: "/",
    api: API_BASE_PATH,
    admin: "/admin",
};

// Security configurations
const security = {
    sessionSecret: SECRET_ACCESS_KEY || "base64:Olvke97cjrcZg4ZYv2nlXxHTLNIs2XWFw9oVuH/OH5E=",
    sessionExpiration: Number(SESSION_EXPIRATION) || 60 * 60 * 24 * 7, // 1 week default
    saltRounds: Number(SALT_ROUNDS) || 12,
};

// Authentication providers
const AUTH_PROVIDERS = {
    EMAIL: "EMAIL",
    GOOGLE: "GOOGLE",
    PHONE: "PHONE",
    APPLE: "APPLE",
    FACEBOOK: "FACEBOOK",
    GITHUB: "GITHUB",
    LINKEDIN: "LINKEDIN",
    TWITTER: "TWITTER",
};

// Role-based configurations
const roles = {
    type: {
        ADMIN: "ADMIN",
        USER: "USER",
        MEMBER: "MEMBER",
        PARTICIPANT: "PARTICIPANT",
    },
    adminRole: {
        GENERAL: "GENERAL",
        SUPPORT: "SUPPORT",
        SUPER_ADMIN: "SUPER_ADMIN",
    },
    userRole: {
        GENERAL: "GENERAL",
        VENDOR: "VENDOR",
        SHOWROOM_MANAGER: "SHOWROOM_MANAGER",
        OTHERS: "OTHERS",
        CORPORATE_HR: "CORPORATE_HR",
    },
};

// User status constants
const USER_STATUS = {
    ACTIVE: "ACTIVE",
    RESIGNED: "RESIGNED",
    TERMINATED: "TERMINATED",
    RETIRED: "RETIRED",
    EXPIRED: "EXPIRED",
    ABSCONDED: "ABSCONDED",
    INACTIVE: "INACTIVE",
    SUSPENDED: "SUSPENDED",
    DELETED: "DELETED",
};

// Page status
const pageStatus = {
    DRAFT: "draft",
    PUBLISHED: "published",
    INACTIVE: "inactive",
};

// Path configurations
const rootPath = path.normalize(dirname + "/..");

const paths = {
    port: PORT,
    url: URL,
    root: rootPath,
    root_public: `${rootPath}/public/`,
    flutterApp: `../../../../../../tests/artisian/test/build/web`,
    adminWeb: `../../../client/build`,
    views: `${rootPath}/views/`,
    publicKey: "public",
    public_url: `${URL}/public/`,
    DEFAULT_USER_IMAGE: "default_user_image.png",
    DEFAULT_NO_IMAGE: "no_image.png",
    DEFAULT_USER_IMAGE_PATH: "user_images/",
    DEFAULT_SUPPORT_IMAGE_PATH: "support/",
};

// Device configurations
const Device = {
    os: {
        WINDOWS: "Windows",
        MACOS: "macOS",
        LINUX: "Linux",
        IOS: "iOS",
        ANDROID: "Android",
    },
    deviceType: {
        DESKTOP: "desktop",
        MOBILE: "mobile",
        TABLET: "tablet",
        UNKNOWN: "unknown",
    }
};

// Redis configurations
const Redis = {
    Enabled: REDIS_ENABLED === "true",
    Host: REDIS_HOST || "localhost",
    Port: Number(REDIS_PORT) || 6379,
    Password: REDIS_PASSWORD || "",
    KEY: REDIS_KEY || "TRIDGE_",
};

// Redis keys
const REDIS_KEYS = {
    ADMIN_AUTH: "ADMIN_AUTH",
    USER_AUTH: "USER_AUTH",
    USER_DETAILS: "USER_DETAILS",
    NOTIFICATION_PREFERENCE: "NOTIFICATION_PREFERENCE_",
    TICKET_DETAILS: "TICKET_DETAILS_",
    TICKET_REPLY_DETAILS: "TICKET_REPLY_DETAILS_",
};

// Event system
const EVENT = {
    Enabled: EVENT_ENABLED === "true",
    USER_UPDATE: "USER_UPDATE",
    TICKET_UPDATE: "TICKET_UPDATE",
};

// Logging configuration
const log = {
    LOG_ENABLED: LOG_ENABLED == "true" || false,
    WARNING_ENABLED: WARNING_ENABLED == "true" || false,
    ERROR_ENABLED: ERROR_ENABLED == "true" || false,
};

const TICKET_STATUS = {
    OPEN: "OPEN",
    IN_PROGRESS: "IN_PROGRESS",
    RESOLVED: "RESOLVED",
    CLOSED: "CLOSED",
};

const TICKET_PRIORITY = {
    LOW: "LOW",
    MEDIUM: "MEDIUM",
    HIGH: "HIGH",
    CRITICAL: "CRITICAL",
};

const MessageType = {
    TEXT: "TEXT",
    IMAGE: "IMAGE",
    VIDEO: "VIDEO",
    AUDIO: "AUDIO",
    LOCATION: "LOCATION",
    CONTACT: "CONTACT",
    LINK: "LINK",
    FILE: "FILE",
};

// Final Constants Object (Self-contained)
const Constants = {
    app,
    db,
    envs,
    routes,
    security,
    AUTH_PROVIDERS,
    roles,
    USER_STATUS,
    pageStatus,
    TIME_ZONE: Number(TIME_ZONE) || 5.5,
    TIME_ZONE_NAME: TIME_ZONE_NAME || "UTC",
    DATE_TIME_FORMAT: "%Y-%m-%d | %H:%M",
    DATE_FORMAT: "%Y-%m-%d",
    TIME_FORMAT: "%H:%M:%S",
    paths,
    Device,
    Redis,
    REDIS_KEYS,
    EVENT,
    log,
    TICKET_STATUS,
    TICKET_PRIORITY,
    MessageType,
};

export default Constants;
