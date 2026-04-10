import axiosInstance from '../api/axios';
import { API_BASE_URL } from '../constants/apiConstants';
import { extractError } from '../utils/extractError';

export const getOrganizerProfile = async () => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/organizer-profile/me`
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const updateOrganizerProfile = async (payload) => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/organizer-profile/me`,
      payload
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};
