import axios from 'axios';
import { API_BASE_URL } from '../constants/apiConstants';
import { extractError } from '../utils/extractError';
import axiosInstance from '../api/axios';

export const getAllEvents = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/events`);

    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const cleanUp = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/events/cleanup`);
    console.log('CLEANUP ', response);

    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

// Home page APIs
export const getFeaturedEvents = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/home/featured`);
    return response.data.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const getNewEvents = async (limit = 8) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/home/new-events`, {
      params: { limit },
    });
    return response.data.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const getThisWeekendEvents = async (limit = 8) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/home/this-weekend`, {
      params: { limit },
    });
    return response.data.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const getTrendingEvents = async (limit = 8) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/home/trending`, {
      params: { limit },
    });
    return response.data.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const getSellingFastEvents = async (limit = 8) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/home/selling-fast`, {
      params: { limit },
    });
    return response.data.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const getEventsByCategory = async (categoryId, limit = 8) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/home/category/${categoryId}`,
      {
        params: { limit },
      }
    );
    return response.data.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const trackEventView = async (eventId) => {
  try {
    await axios.post(`${API_BASE_URL}/home/event/${eventId}/view`);
  } catch (error) {
    // Silent fail - không cần throw error cho tracking
    console.error('Failed to track event view:', error);
  }
};

export const getAllCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/categories`);
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const createEvent = async (data) => {
  try {
    console.log('Gửi dữ liệu tạo sự kiện:', data);
    const response = await axiosInstance.post(`${API_BASE_URL}/events`, data);
    console.log('DATA trả về: ', response);

    return response;
  } catch (error) {
    throw extractError(error);
  }
};

export const updateEvent = async (id, data) => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/events/${id}`,
      data
    );

    return response;
  } catch (error) {
    throw extractError(error);
  }
};

export const deleteEvent = async (id) => {
  try {
    const response = await axiosInstance.delete(`${API_BASE_URL}/events/${id}`);
    console.log('DELETE trả về: ', response);

    return response;
  } catch (error) {
    throw extractError(error);
  }
};

export const getEventById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/events/${id}`);
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const getEventsByUserId = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/events/user/${userId}`);
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

// Dashboard APIs
export const getDashboardOverview = async (eventId) => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/events/${eventId}/dashboard/overview`
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const getRevenueChart = async (eventId, params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.groupBy) queryParams.append('groupBy', params.groupBy);

    const url = `${API_BASE_URL}/events/${eventId}/dashboard/revenue-chart${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};
