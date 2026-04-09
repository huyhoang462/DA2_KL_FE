import axiosInstance from '../api/axios';
import { API_BASE_URL } from '../constants/apiConstants';
import { extractError } from '../utils/extractError';

export const getNotifications = async (params = {}) => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/notifications`, {
      params,
    });
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const getUnreadNotificationsCount = async () => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/notifications/unread-count`
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await axiosInstance.patch(
      `${API_BASE_URL}/notifications/${notificationId}/read`
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await axiosInstance.patch(
      `${API_BASE_URL}/notifications/read-all`
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};
