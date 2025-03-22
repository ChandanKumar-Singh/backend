import Constants from "../../config/constants.js";
import { mObj, mongoOne } from "../../lib/mongoose.utils.js";
import RedisKeys from "../../lib/RedisKeys.js";
import NotificationPreference from "../../models/core/notification/NotificationPreference.js";
import EventService from "../../services/EventService.js";
import RedisService from "../../services/RedisService.js";
import DateUtils from "../../utils/DateUtils.js";
import { logg, logger } from "../../utils/logger.js";

class NotificationPreferenceDBO {
    constructor() {
        EventService.on(Constants.EVENT.USER_LOGOUT, async (userId) =>
            this.purgeCache(userId)
        );
        EventService.on(Constants.EVENT.USER_DELETE, async (userId) =>
            this.purgeCache(userId)
        );
        EventService.on(
            Constants.EVENT.NOTIFICATION_PREFERENCE_UPDATE,
            async (userId) => this.purgeCache(userId)
        );
    }

    async query({
        query = [],
        midQuery = [],
        project = {},
        timezone = Constants.TIME_ZONE_NAME,
        session = null,
        page = 1,
        limit = 20,
    } = {}) {
        try {
            const skip = (page - 1) * limit;

            const pipeline = [
                ...query,
                ...midQuery,
                {
                    $lookup: {
                        from: "users",
                        localField: "user",
                        foreignField: "_id",
                        as: "user",
                    },
                },
                { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
                {
                    $addFields: {
                        createdAtText: DateUtils.aggregate("$createdAt", { timezone }),
                        updatedAtText: DateUtils.aggregate("$updatedAt", { timezone }),
                        lastActiveAtText: DateUtils.aggregate("$lastActiveAt", {
                            timezone,
                        }),
                    },
                },
            ];

            pipeline.push({
                $project: {
                    preferences: 1,
                    deliveryChannels: 1,
                    user: {
                        _id: 1,
                        email: 1,
                        name: 1,
                        fullName: 1,
                        profileImage: 1,
                        role: 1,
                        type: 1,
                        status: 1,
                        isActive: 1,
                    },
                    ...project,
                },
            });

            return await NotificationPreference.aggregate(pipeline).session(session);
        } catch (error) {
            console.error("Error in NotificationPreferenceDBO -> query:", error);
            throw error;
        }
    }

    async fetchNotificationPreferenceById(userId, { session = null } = {}) {
        const redisData = await RedisService.hget(...RedisKeys.NOTIFICATION_PREFERENCE(userId));
        if (redisData) return redisData;
        let obj = mongoOne(
            await this.query({ query: [{ $match: { user: mObj(userId) } }], session })
        );
        if (obj) {
            this.cacheUserPreference(userId, obj);
            return obj;
        } else return await this.createUserPreference(userId, { session });
    }

    async createUserPreference(
        userId,
        { preferences, deliveryChannels, session = null }
    ) {
        logg(`Creating default notification preferences for user: ${userId}`);
        let obj = await NotificationPreference.createDefaultPreferences(
            userId,
            preferences,
            deliveryChannels,
            { session }
        );
        // obj = await this.fetchNotificationPreferenceById(userId, { session });
        this.cacheUserPreference(userId, obj);
        logg(`Notification preferences updated for user: ${userId}`, obj);
        return obj;
    }

    async updateUserPreferences(userId, preferences, { session = null } = {}) {
        let obj = await NotificationPreference.updateUserPreferences(
            userId,
            preferences
        );
        obj = await this.fetchNotificationPreferenceById(userId, { session });
        this.cacheUserPreference(userId, obj);
        return obj;
    }

    async updateDeliveryChannels(userId, channels, { session = null } = {}) {
        let obj = await NotificationPreference.updateDeliveryChannels(
            userId,
            channels
        );
        obj = await this.fetchNotificationPreferenceById(userId, { session });
        this.cacheUserPreference(userId, obj);
        return obj;
    }

    async enableCategory(userId, category, { session = null } = {}) {
        let obj = await NotificationPreference.findOne({ user: userId });
        obj = await obj.enableCategory(category);
        this.cacheUserPreference(userId, obj);
        return this.fetchNotificationPreferenceById(userId, { session });
    }

    async disableCategory(userId, category, { session = null } = {}) {
        let obj = await NotificationPreference.findOne({ user: userId });
        obj = await obj.disableCategory(category);
        obj = await this.fetchNotificationPreferenceById(userId, { session });
        this.cacheUserPreference(userId, obj);
        return obj;
    }
    /**
     * Cache user notification preference in Redis.
     * @param {String} userId - User ID.
     * @param {Object} data - Notification preference data.
     */
    cacheUserPreference(userId, data) {
        RedisService.hset(...RedisKeys.NOTIFICATION_PREFERENCE(userId), data);  
    }
    emitUpdateEvent(userId) {
        EventService.emit(Constants.EVENT.NOTIFICATION_PREFERENCE_UPDATE, userId);
    }

    purgeCache(userId) {
        RedisService.hdel(...RedisKeys.NOTIFICATION_PREFERENCE(userId));
    }
}

export default new NotificationPreferenceDBO();
