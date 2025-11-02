import axios from 'axios';
import { API_BASE_URL } from '../constants/apiConstants';
import { extractError } from '../utils/extractError';

export const getAllCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/categories`);
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};
