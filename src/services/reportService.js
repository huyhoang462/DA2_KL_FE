import axiosInstance from '../api/axios';
import { API_BASE_URL } from '../constants/apiConstants';
import { extractError } from '../utils/extractError';

const buildReportQueryParams = (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.status) params.append('status', filters.status);
  if (filters.targetType) params.append('targetType', filters.targetType);

  return params;
};

export const createReport = async (payload) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/reports`,
      payload
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const getReports = async (filters = {}) => {
  try {
    const params = buildReportQueryParams(filters);
    const query = params.toString();
    const response = await axiosInstance.get(
      `${API_BASE_URL}/reports${query ? `?${query}` : ''}`
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const getReportById = async (reportId) => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/reports/${reportId}`
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const reviewReport = async (reportId, payload) => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/reports/${reportId}/review`,
      payload
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const deleteReport = async (reportId) => {
  try {
    const response = await axiosInstance.delete(
      `${API_BASE_URL}/reports/${reportId}`
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const getReportSummary = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/reports/summary`);
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};
