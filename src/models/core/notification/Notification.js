import mongoose from "mongoose";
import {
    NotificationSource,
    NotificationCategory,
    NotificationType,
    DeliveryChannel,
    NotificationPriority,
} from "../../../config/NotificationEnums.js";

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
            index: true,
        },

        source: {
            type: String,
            required: true,
            enum: Object.values(NotificationSource),
            index: true,
        },

        category: {
            type: String,
            required: true,
            enum: Object.values(NotificationCategory),
            index: true,
        },

        type: {
            type: String,
            required: true,
            enum: Object.values(NotificationType),
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        message: {
            type: String,
            required: true,
            trim: true,
        },

        actionCode: {
            type: String,
            required: true,
            trim: true,
        },

        actionData: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },

        url: {
            type: String,
            default: null,
            validate: {
                validator: function (v) {
                    return !v || /^https?:\/\/.+/.test(v);
                },
                message: "Invalid URL format.",
            },
        },

        read: {
            type: Boolean,
            default: false,
        },

        sent: {
            type: Boolean,
            default: false,
        },

        deliveryChannels: {
            type: [String],
            enum: Object.values(DeliveryChannel),
            default: [DeliveryChannel.PUSH],
        },

        priority: {
            type: String,
            enum: Object.values(NotificationPriority),
            default: NotificationPriority.NORMAL,
        },
    },

    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ✅ Virtual field to check if the notification is unread
notificationSchema.virtual("isUnread").get(function () {
    return !this.read;
});

// ✅ Pre-save hook to ensure `actionData` is always an object
notificationSchema.pre("save", function (next) {
    if (!this.actionData) {
        this.actionData = {};
    }
    next();
});

// ─────────────────────────────────────────────────────────────────────────────
// ✅ Static Methods (Model-Level)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new notification
 * @param {Object} data - Notification details
 * @returns {Promise<Object>} - Created notification
 */
notificationSchema.statics.createNotification = async function (data) {
    return await this.create(data);
};

/**
 * Get notifications for a specific user
 * @param {String} userId - User's ID
 * @param {Number} limit - Number of notifications to fetch
 * @returns {Promise<Array>} - List of notifications
 */
notificationSchema.statics.getUserNotifications = async function (
    userId,
    { limit = 10, page = 1, sort = "-createdAt" }
) {
    const query = { user: userId };
    if (page < 0) {
        return await this.find(query).sort(sort);
    }
    const options = {
        limit: Math.abs(limit),
        sort,
        skip: Math.abs(limit) * (Math.abs(page) - 1),
    };
    return await this.find(query, null, options);
};

/**
 * Delete a notification by ID
 * @param {String} notificationId - Notification ID
 * @returns {Promise<Object>} - Deleted notification
 */
notificationSchema.statics.deleteNotification = async function (
    notificationId
) {
    return await this.findByIdAndDelete(notificationId);
};

// ─────────────────────────────────────────────────────────────────────────────
// ✅ Instance Methods (Document-Level)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mark a notification as read
 * @returns {Promise<Object>} - Updated notification
 */
notificationSchema.methods.markAsRead = async function () {
    this.read = true;
    return await this.save();
};

/**
 * Mark a notification as unread
 * @returns {Promise<Object>} - Updated notification
 */
notificationSchema.methods.markAsUnread = async function () {
    this.read = false;
    return await this.save();
};

/**
 * Update notification details
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} - Updated notification
 */
notificationSchema.methods.updateNotification = async function (updates) {
    Object.assign(this, updates);
    return await this.save();
};

export default mongoose.model("Notification", notificationSchema);
