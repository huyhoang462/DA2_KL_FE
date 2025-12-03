import axios from 'axios';
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

    const response = await axios.get(
      `${API_BASE_URL}/events/pending?${params}`
    );
    console.log('Pending Events:', response.data);
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const getEventById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/events/${id}`);
    console.log('Event details:', response.data);
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const updateEventStatus = async (id, status) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/events/status/${id}`, {
      status,
    });
    console.log('Updated Event details:', response.data);
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};
