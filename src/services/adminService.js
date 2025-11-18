import axios from 'axios';
import { mockAdminPaymentMethods } from '../utils/mockData';
import { API_BASE_URL } from '../constants/apiConstants';
import { extractError } from '../utils/extractError';

export const getAdminPaymentMethods = async () => {
  try {
    // const response = await axios.get(`${API_BASE_URL}/admin/payment-method`);
    // console.log('Response data in getEventById:', response.data);
    // return response.data;
    return mockAdminPaymentMethods;
  } catch (error) {
    throw extractError(error);
  }
};
