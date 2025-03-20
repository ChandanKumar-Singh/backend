export const NotificationSource = {
    ORDER_SYSTEM: "ORDER_SYSTEM",  // Notifications from order-related systems
    ADMIN_PANEL: "ADMIN_PANEL",    // Notifications generated from admin actions
    USER_CHAT: "USER_CHAT",        // Notifications from user messages
    SYSTEM_ALERT: "SYSTEM_ALERT",  // System-generated alerts
    MARKETING: "MARKETING",        // Promotional or marketing notifications
    SECURITY_SYSTEM: "SECURITY_SYSTEM",  // Security-related notifications
    SUPPORT_SYSTEM: "SUPPORT_SYSTEM",    // Customer support notifications
};

export const NotificationCategory = {
    ORDER: "ORDER",       // Order-related updates
    SYSTEM: "SYSTEM",     // General system notifications
    CHAT: "CHAT",         // Messages from chat system
    PROMOTION: "PROMOTION", // Deals, offers, and marketing
    ADMIN_ACTIONS: "ADMIN_ACTIONS",  // Actions taken by admin
    SECURITY: "SECURITY",  // Login attempts, password changes, etc.
    SUPPORT: "SUPPORT",    // Customer support messages
    PROFILE_UPDATES: "PROFILE_UPDATES",  // Profile-related notifications
};

export const NotificationType = {
    USER: "USER",         // Notifications meant for users
    ADMIN: "ADMIN",       // Notifications meant for admins
    SYSTEM: "SYSTEM",     // Notifications triggered by system events
    PROMOTION: "PROMOTION", // Promotional notifications
    MODERATOR: "MODERATOR", // Notifications targeted at moderators
    SUPPORT: "SUPPORT",   // Notifications for support tickets
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
