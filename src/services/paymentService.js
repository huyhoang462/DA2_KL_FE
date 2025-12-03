import axios from 'axios';
import { API_BASE_URL } from '../constants/apiConstants';
import { extractError } from '../utils/extractError';
import axiosInstance from '../api/axios';

export const getMyPayoutMethods = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/payout-methods`);

    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const deletePayoutMethod = async (id) => {
  try {
    const response = await axiosInstance.delete(
      `${API_BASE_URL}/payout-methods/${id}`
    );
    console.log('Deleted payout method:', response.data);
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};
