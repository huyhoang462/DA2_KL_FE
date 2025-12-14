import axios from 'axios';
import { API_BASE_URL } from '../constants/apiConstants';
import { extractError } from '../utils/extractError';

export const searchSuggestions = async (query) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/events/search?q=${query}`
    );

    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const searchEvents = async (filters) => {
  try {
    const params = new URLSearchParams();

    if (filters.q) params.append('q', filters.q);
    if (filters.category?.length) {
      filters.category.forEach((cat) => params.append('category', cat));
    }
    if (filters.cityCode) params.append('city', filters.cityCode);
    if (filters.minPrice > 0) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice < 5000000) params.append('maxPrice', filters.maxPrice);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await axios.get(
      `${API_BASE_URL}/events/search/events?${params.toString()}`
    );

    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};
