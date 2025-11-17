import axios from 'axios';
import { API_BASE_URL } from '../constants/apiConstants';
import { extractError } from '../utils/extractError';
import axiosInstance from '../api/axios';

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
    console.log('DATA trả về: ', response.data);

    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const getEventById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/events/${id}`);
    console.log('Response data in getEventById:', response.data);
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};
