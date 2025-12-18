/**
 * Notification API Service
 * Handles all notification-related API calls
 */
import api from "./api";
import logger from "../utils/logger";

export const notificationAPI = {
  /**
   * Get notifications for current user
   * @param {Object} params - Query parameters
   * @param {boolean} params.is_read - Filter by read status
   * @param {number} params.skip - Pagination offset
   * @param {number} params.limit - Pagination limit
   */
  getNotifications: async (params = {}) => {
    try {
      const response = await api.get("/notifications/", { params });
      return response.data;
    } catch (error) {
      logger.error("Error fetching notifications:", error);
      throw error;
    }
  },

  /**
   * Get count of unread notifications
   */
  getUnreadCount: async () => {
    try {
      const response = await api.get("/notifications/unread-count");
      return response.data;
    } catch (error) {
      logger.error("Error fetching unread count:", error);
      throw error;
    }
  },

  /**
   * Mark a notification as read
   * @param {number} notificationId - Notification ID
   */
  markAsRead: async (notificationId) => {
    try {
      const response = await api.patch(
        `/notifications/${notificationId}/read`
      );
      return response.data;
    } catch (error) {
      logger.error(`Error marking notification ${notificationId} as read:`, error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    try {
      const response = await api.patch("/notifications/mark-all-read");
      return response.data;
    } catch (error) {
      logger.error("Error marking all notifications as read:", error);
      throw error;
    }
  },

  /**
   * Delete a notification
   * @param {number} notificationId - Notification ID
   */
  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error deleting notification ${notificationId}:`, error);
      throw error;
    }
  },
};
