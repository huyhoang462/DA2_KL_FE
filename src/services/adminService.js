import axios from 'axios';
import axiosInstance from '../api/axios';
import { API_BASE_URL } from '../constants/apiConstants';
import { extractError } from '../utils/extractError';
import { mockAdminPaymentMethods } from '../utils/mockData';

export const getAdminPaymentMethods = async () => {
  return mockAdminPaymentMethods;
};
export const getPendingEvents = async ({ page = 1, limit = 10 }) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await axiosInstance.get(
      `${API_BASE_URL}/events/pending?${params}`
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const getEventById = async (id) => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/events/${id}`);
    console.log('Event details:', response.data);
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const updateEventStatus = async (id, status, reason = null) => {
  try {
    const payload = { status };
    if (reason) {
      payload.reason = reason;
    }
    const response = await axiosInstance.patch(
      `${API_BASE_URL}/events/status/${id}`,
      payload
    );
    console.log('Updated Event details:', response.data);
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const getDashboardOverview = async () => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/admin/dashboard/overview`
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

// User Management APIs
export const getAllUsers = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.role) params.append('role', filters.role);
    if (filters.status) params.append('status', filters.status);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    params.append('page', filters.page || 1);
    params.append('limit', filters.limit || 20);

    const response = await axiosInstance.get(
      `${API_BASE_URL}/admin/users?${params}`
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const getUserById = async (id) => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/admin/users/${id}`
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const updateUserRole = async (id, role) => {
  try {
    const response = await axiosInstance.patch(
      `${API_BASE_URL}/admin/users/${id}/role`,
      { role }
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const banUser = async (id, reason) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/admin/users/${id}/ban`,
      { reason }
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const unbanUser = async (id) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/admin/users/${id}/unban`
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const deleteUser = async (id, hardDelete = false) => {
  try {
    const params = hardDelete ? '?hardDelete=true' : '';
    const response = await axiosInstance.delete(
      `${API_BASE_URL}/admin/users/${id}${params}`
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

// Event Management APIs
export const getAllEvents = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.format) params.append('format', filters.format);
    if (filters.isFeatured !== null && filters.isFeatured !== undefined) {
      params.append('isFeatured', filters.isFeatured);
    }
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    params.append('page', filters.page || 1);
    params.append('limit', filters.limit || 20);

    const response = await axiosInstance.get(
      `${API_BASE_URL}/admin/events?${params}`
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const getAdminEventById = async (id) => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/admin/events/${id}`
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const updateEventStatusAdmin = async (id, status, reason = null) => {
  try {
    const payload = { status };
    if (reason) {
      payload.reason = reason;
    }
    const response = await axiosInstance.patch(
      `${API_BASE_URL}/admin/events/${id}/status`,
      payload
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const toggleEventFeatured = async (id, featured) => {
  try {
    const response = await axiosInstance.patch(
      `${API_BASE_URL}/admin/events/${id}/featured`,
      { featured }
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const deleteEvent = async (id, permanent = false) => {
  try {
    const params = permanent ? '?permanent=true' : '';
    const response = await axiosInstance.delete(
      `${API_BASE_URL}/admin/events/${id}${params}`
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

// ============= REPORTS APIs =============

export const getRevenueReport = async (params) => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/admin/reports/revenue`,
      { params }
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const getTicketReport = async (params) => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/admin/reports/tickets`,
      { params }
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const getUserReport = async (params) => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/admin/reports/users`,
      { params }
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const getCategoryReport = async () => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/admin/reports/categories`
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const exportReport = async (data) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/admin/reports/export`,
      data
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

// Transaction Management APIs
export const getTransactions = async (params) => {
  try {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (
        params[key] !== null &&
        params[key] !== undefined &&
        params[key] !== ''
      ) {
        queryParams.append(key, params[key]);
      }
    });

    const response = await axiosInstance.get(
      `${API_BASE_URL}/admin/transactions?${queryParams}`
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const getTransactionById = async (id) => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/admin/transactions/${id}`
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const refundTransaction = async (id, reason) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/admin/transactions/${id}/refund`,
      { reason }
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const getTransactionStatistics = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const response = await axiosInstance.get(
      `${API_BASE_URL}/admin/transactions/statistics?${queryParams}`
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

// User Detail Management APIs - getUserOrders and getUserEvents
export const getUserOrders = async (userId, params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const response = await axiosInstance.get(
      `${API_BASE_URL}/admin/users/${userId}/orders?${queryParams}`
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const getUserEvents = async (userId, params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const response = await axiosInstance.get(
      `${API_BASE_URL}/admin/users/${userId}/events?${queryParams}`
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};
