import mongoose from "mongoose";
import { NotificationCategory, DeliveryChannel } from "../../../config/NotificationEnums.js";

const notificationPreferenceSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },

        preferences: {
            type: Map,
            of: Boolean,
            default: () =>
                Object.keys(NotificationCategory).reduce((acc, key) => {
                    acc[key] = true;
                    return acc;
                }, {}),
            validate: {
                validator: function (preferences) {
                    if (!(preferences instanceof Map)) return false; // Ensure it's a Map
                    const preferenceKeys = Array.from(preferences.keys()); // Extract only user-defined keys
                    return preferenceKeys.every(category => Object.keys(NotificationCategory).includes(category));
                },
                message: "Invalid notification preference provided.",
            }
        },


        deliveryChannels: {
            type: [String],
            enum: Object.values(DeliveryChannel),
            default: [DeliveryChannel.PUSH],
            validate: {
                validator: function (channels) {
                    return channels.every(channel => Object.values(DeliveryChannel).includes(channel));
                },
                message: "Invalid delivery channel provided.",
            }
        }
    },
    { timestamps: true }
);

// ─────────────────────────────────────────────────────────────────────────────
// ✅ Static Methods (Model-Level Operations)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new notification preference for a user (if not exists)
 * @param {String} userId - The user's ID
 * @returns {Promise<Object>} - The created or existing notification preference
 */
notificationPreferenceSchema.statics.createDefaultPreferences = async function (userId, preferences = {}, deliveryChannels = [], { session = null } = {}) {
    let obj = await this.findOne({ user: userId });
    if (!obj) {
        const [created] = await this.create(
            [
                {
                    user: userId,
                }
            ],
            { session }
        );
        obj = created;
    }
    return obj;
};


/**
 * Update a user's notification preferences
 * @param {String} userId - The user's ID
 * @param {Object} preferences - The new preferences
 * @returns {Promise<Object>} - The updated notification preferences
 */
notificationPreferenceSchema.statics.updateUserPreferences = async function (userId, preferences) {
    return this.findOneAndUpdate(
        { user: userId },
        { $set: { preferences } },
        { new: true }
    );
};

/**
 * Update a user's delivery channels
 * @param {String} userId - The user's ID
 * @param {Array} channels - The new delivery channels
 * @returns {Promise<Object>} - The updated notification preferences
 */
notificationPreferenceSchema.statics.updateDeliveryChannels = async function (userId, channels) {
    return this.findOneAndUpdate(
        { user: userId },
        { $set: { deliveryChannels: channels } },
        { new: true }
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// ✅ Instance Methods (Document-Level Operations)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Enable a notification category for the user
 * @param {String} category - Notification category to enable
 * @returns {Promise<Object>} - Updated preferences
 */
notificationPreferenceSchema.methods.enableCategory = async function (category) {
    if (Object.keys(NotificationCategory).includes(category)) {
        this.preferences.set(category, true);
        return await this.save();
    }
    throw new Error("Invalid notification category.");
};

/**
 * Disable a notification category for the user
 * @param {String} category - Notification category to disable
 * @returns {Promise<Object>} - Updated preferences
 */
notificationPreferenceSchema.methods.disableCategory = async function (category) {
    if (Object.keys(NotificationCategory).includes(category)) {
        this.preferences.set(category, false);
        return await this.save();
    }
    throw new Error("Invalid notification category.");
};

export default mongoose.model("NotificationPreference", notificationPreferenceSchema);
