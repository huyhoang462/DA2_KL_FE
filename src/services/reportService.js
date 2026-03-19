import axiosInstance from '../api/axios';
import { API_BASE_URL } from '../constants/apiConstants';
import { extractError } from '../utils/extractError';

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
