import Constants from "../../config/constants.js";
import {
  DeliveryChannel,
  NotificationCodes,
  NotificationPriority,
} from "../../config/NotificationEnums.js";
import Notification from "../../models/core/notification/Notification.js";
import EmailService from "../EmailService.js";
import RedisService from "../RedisService.js";
import SmsService from "../SmsService.js";
import PushService from "./PushService.js";
import ApiError from "../../middlewares/ApiError.js";
import httpStatus from "http-status";
import ResponseCodes from "../../config/ResponseCodes.js";
import UserDBO from "../../dbos/UserDBO.js";
import EventService from "../EventService.js";
import NotificationMessages from "../../config/notificationMessages.js";
import {
  errorLog,
  infoLog,
  logg,
  logger,
  LogUtils,
} from "../../utils/logger.js";
import NotificationPreferenceDBO from "../../dbos/notification/NotificationPreferenceDBO.js";

class NotificationService {
  /**
   * Send a notification to a user based on their preferences.
   * @param {Object} payload - Notification data.
   * @returns {Promise<Object|null>} - Created notification or null if blocked.
   */
  static async sendNotificationToUser(payload) {
    try {
      logg("📧 NotificationService.sendNotification payload", payload);
      let {
        user,
        source,
        category,
        type,
        title = NotificationMessages.OTHER.GENERAL_NOTIFICATION.title,
        message = NotificationMessages.OTHER.GENERAL_NOTIFICATION.message,
        code = NotificationCodes.NOTIFICATION,
        data,
        url,
        priority,
      } = payload;
      if (!user) throw new Error("User ID is required for notifications");
      if (typeof user === "object") user = user._id.toString();

      // logg("📧 NotificationService.sendNotification preferences");
      const preferences = await this.getUserNotificationPreferences(user);
      // logg("📧 NotificationService.sendNotification preferences", preferences,category);
      if (!preferences || !preferences.preferences[category]) {
        infoLog(
          `🔕 Notification blocked for ${user} `,
          `(Category: ${category})`
        );
        return null;
      }

      const notification = await Notification.create({
        user,
        source,
        category,
        type,
        title,
        message,
        code,
        data: JSON.stringify(data || {}),
        url,
        priority: priority || NotificationPriority.NORMAL,
        deliveryChannels: preferences.deliveryChannels,
      });

      await this.dispatchNotification(notification, preferences);
      return notification;
    } catch (error) {
      errorLog("❌ NotificationService.sendNotification Error:", error);
      return null;
    }
  }

  /**
   * Get user notification preferences from cache or database.
   * @param {String} userId - User ID.
   * @returns {Promise<Object>} - User preferences.
   */
  static async getUserNotificationPreferences(userId) {
    let preferences =
      await NotificationPreferenceDBO.fetchNotificationPreferenceById(userId);
    return preferences;
  }

  /**
   * Dispatch notifications through the correct delivery channels.
   * @param {Object} notification - Notification object.
   * @param {Object} preferences - User preferences.
   */
  static async dispatchNotification(notification, preferences) {
    const { user, title, message, url, deliveryChannels } = notification;
    const userData = await UserDBO.getById(user);
    const sendOperations = [];

    if (deliveryChannels.includes(DeliveryChannel.PUSH)) {
      sendOperations.push(
        PushService.sendPushNotification(
          userData.fcmToken,
          title,
          message,
          url,
          { notification }
        )
      );
    }
    if (deliveryChannels.includes(DeliveryChannel.EMAIL)) {
      sendOperations.push(
        EmailService.sendEmailNotification(user, title, message, notification)
      );
    }
    if (deliveryChannels.includes(DeliveryChannel.SMS)) {
      sendOperations.push(SmsService.sendSmsNotification(user, message));
    }

    await Promise.all(sendOperations);
    EventService.emit("NOTIFICATION_SENT", { user, notification });
  }

  /**
   * Mark a notification as read.
   * @param {String} notificationId - Notification ID.
   * @returns {Promise<Object>} - Updated notification.
   */
  static async markAsRead(notificationId) {
    const notification = await Notification.findById(notificationId);
    if (!notification)
      throw new ApiError(httpStatus.NOT_FOUND, ResponseCodes.ERROR.NOT_FOUND);
    await notification.markAsRead();
  }

  /**
   * Mark all user notifications as read.
   * @param {String} userId - User ID.
   * @returns {Promise<Number>} - Number of updated notifications.
   */
  static async markAllAsRead(userId) {
    return await Notification.updateMany(
      { user: userId, read: false },
      { read: true, readAt: new Date() }
    );
  }

  /**
   * Get user notifications with pagination.
   * @param {String} userId - User ID.
   * @param {Number} page - Page number.
   * @param {Number} limit - Number of notifications per page.
   * @returns {Promise<Object>} - Paginated notifications.
   */
  static async getUserNotifications(userId, page = 1, limit = 10) {
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Notification.countDocuments({ user: userId });

    return { total, page, limit, notifications };
  }
}

export default NotificationService;
