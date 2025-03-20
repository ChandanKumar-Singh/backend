const NotificationMessages = {
    ORDER: {
        ORDER_PLACED: {
            title: "Order Confirmed",
            message: "Your order #{{orderId}} has been successfully placed."
        },
        ORDER_SHIPPED: {
            title: "Order Shipped",
            message: "Your order #{{orderId}} has been shipped and is on the way."
        },
        ORDER_DELIVERED: {
            title: "Order Delivered",
            message: "Your order #{{orderId}} has been delivered successfully."
        },
        ORDER_CANCELLED: {
            title: "Order Cancelled",
            message: "Your order #{{orderId}} has been cancelled."
        }
    },

    CHAT: {
        NEW_MESSAGE: {
            title: "New Message",
            message: "You have a new message from {{senderName}}."
        },
        MENTION: {
            title: "You Were Mentioned",
            message: "{{senderName}} mentioned you in a chat."
        },
        GROUP_INVITE: {
            title: "Group Chat Invite",
            message: "You have been invited to join {{groupName}}."
        }
    },
    TICKET: {
        TICKET_UPDATED: {
            title: "Ticket Updated",
            message: "Your ticket has been updated successfully."
        },
    },

    SYSTEM: {
        SYSTEM_UPDATE: {
            title: "System Update",
            message: "A new update is available. Please update your app."
        },
        MAINTENANCE: {
            title: "Scheduled Maintenance",
            message: "System maintenance is scheduled for {{date}} at {{time}}."
        },
        GENERAL_ANNOUNCEMENT: {
            title: "Important Announcement",
            message: "{{announcement}}"
        }
    },

    SECURITY: {
        UNUSUAL_LOGIN: {
            title: "Security Alert",
            message: "We detected an unusual login attempt from {{location}}."
        },
        PASSWORD_CHANGED: {
            title: "Password Changed",
            message: "Your password was changed successfully."
        },
        TWO_FACTOR_ENABLED: {
            title: "Two-Factor Authentication Enabled",
            message: "Two-factor authentication has been enabled for your account."
        },
        TWO_FACTOR_DISABLED: {
            title: "Two-Factor Authentication Disabled",
            message: "Two-factor authentication has been disabled."
        }
    },

    PROMOTION: {
        NEW_OFFER: {
            title: "Exclusive Offer",
            message: "Enjoy a special {{discount}}% discount on your next purchase."
        },
        FLASH_SALE: {
            title: "Flash Sale Alert",
            message: "Flash sale starts now! Grab your favorite items before the sale ends."
        }
    },

    USER_PROFILE: {
        PROFILE_UPDATED: {
            title: "Profile Updated",
            message: "Your profile has been updated successfully."
        },
        PROFILE_COMPLETED: {
            title: "Profile Completed",
            message: "Your profile has been completed. Start exploring now!"
        },
        PASSWORD_RESET: {
            title: "Password Reset",
            message: "Your password has been reset successfully."
        },
        EMAIL_VERIFIED: {
            title: "Email Verified",
            message: "Your email has been verified successfully."
        },
        PHONE_VERIFIED: {
            title: "Phone Number Verified",
            message: "Your phone number has been verified successfully."
        },
        TWO_FACTOR_AUTH: {
            title: "Two-Factor Authentication",
            message: "Two-factor authentication is required for your account."
        },
        PASSWORD_EXPIRED: {
            title: "Password Expired",
            message: "Your password has expired. Please reset it now."
        },
        EMAIL_UPDATED: {
            title: "Email Address Updated",
            message: "Your email has been changed to {{newEmail}}."
        },
        PHONE_UPDATED: {
            title: "Phone Number Updated",
            message: "Your phone number has been changed to {{newPhone}}."
        },
        PROFILE_PICTURE_UPDATED: {
            title: "Profile Picture Changed",
            message: "Your profile picture has been updated."
        }
    },

    ACCOUNT: {
        ACCOUNT_CREATED: {
            title: "Welcome to {{appName}}",
            message: "Your account has been successfully created. Start exploring now!"
        },
        ACCOUNT_DELETED: {
            title: "Account Deleted",
            message: "Your account has been permanently deleted."
        },
        ACCOUNT_SUSPENDED: {
            title: "Account Suspended",
            message: "Your account has been suspended due to {{reason}}."
        },
        VERIFICATION_REQUIRED: {
            title: "Email Verification Needed",
            message: "Please verify your email address to complete your registration."
        }
    },

    ADMIN: {
        ADMIN_MESSAGE: {
            title: "Message from Admin",
            message: "{{adminMessage}}"
        },
        MODERATION_WARNING: {
            title: "Moderation Warning",
            message: "Your recent activity has been flagged for review."
        },
        ROLE_CHANGED: {
            title: "Account Role Updated",
            message: "Your account role has been changed to {{newRole}}."
        }
    },

    OTHER: {
        GENERAL_NOTIFICATION: {
            title: "Notification",
            message: "{{message}}"
        }
    }
}

export default NotificationMessages;