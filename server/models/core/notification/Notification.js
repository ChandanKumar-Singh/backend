import mongoose from "mongoose";
import {
    NotificationSource,
    NotificationCategory,
    NotificationType,
    DeliveryChannel,
    NotificationPriority,
    NotificationCodes,
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

        code: {
            type: String,
            required: true,
            enum: Object.values(NotificationCodes),
            trim: true,
        },

        data: {
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

        readAt: {
            type: Date,
            default: null,
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
notificationSchema.statics.createNotification = async function (data, { session }) {
    return await this.create(data, { session });
};


// ─────────────────────────────────────────────────────────────────────────────
// ✅ Instance Methods (Document-Level)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mark a notification as read
 * @returns {Promise<Object>} - Updated notification
 */
notificationSchema.methods.markAsRead = async function ({ session }) {
    this.read = true;
    this.readAt = new Date();
    return await this.save({ session, new: true });
};

/**
 * Mark a notification as unread
 * @returns {Promise<Object>} - Updated notification
 */
notificationSchema.methods.markAsUnread = async function ({ session }) {
    this.read = false;
    this.readAt = null;
    return await this.save({ session, new: true });
};

/**
 * Update notification details
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} - Updated notification
 */
notificationSchema.methods.updateNotification = async function (updates, { session }) {
    Object.assign(this, updates);
    return await this.save({ session, new: true });
};

// toJson
notificationSchema.methods.toJSON = function () {
    const notification = this.toObject();
    delete notification.__v;
    return notification;
};

export default mongoose.model("Notification", notificationSchema);
