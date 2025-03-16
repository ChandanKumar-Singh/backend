export const NotificationSource = {
    ORDER_SYSTEM: "ORDER_SYSTEM",
    ADMIN_PANEL: "ADMIN_PANEL",
    CHAT: "CHAT",
    SYSTEM_ALERT: "SYSTEM_ALERT",
    PROMOTION: "PROMOTION",
    SECURITY: "SECURITY",
};

export const NotificationCategory = {
    ORDER: "ORDER",
    SYSTEM: "SYSTEM",
    CHAT: "CHAT",
    PROMOTION: "PROMOTION",
    ADMIN: "ADMIN",
    SECURITY: "SECURITY",
    SUPPORT: "SUPPORT",
    PROFILE: "PROFILE",
};

export const NotificationType = {
    USER: "user",
    ADMIN: "admin",
    SYSTEM: "system",
    PROMOTION: "promotion",
    MODERATOR: "moderator",
};

export const DeliveryChannel = {
    PUSH: "push",
    EMAIL: "email",
    SMS: "sms",
    IN_APP: "in_app",
    WEBHOOK: "webhook",
};

export const NotificationPriority = {
    CRITICAL: "critical", // security issues
    HIGH: "high",
    NORMAL: "normal",
    LOW: "low",
    INFO: "info",
};

export const NotificationCodes = {
    NOTIFICATION: "NOTIFICATION",
    USER_UPDATED: "USER_UPDATED",
    PROFILE_COMPLETED: "PROFILE_COMPLETED",
    USER_REGISTERED: "USER_REGISTERED",
}
