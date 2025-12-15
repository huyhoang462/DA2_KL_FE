import axios from 'axios';
import { API_BASE_URL } from '../constants/apiConstants';
import { extractError } from '../utils/extractError';
import axiosInstance from '../api/axios';

export const getMyTickets = async () => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/tickets/my-tickets`
    );

    console.log('DATA trả về: ', response.data.data);
    return response.data.data;
  } catch (error) {
    throw extractError(error);
  }
};
