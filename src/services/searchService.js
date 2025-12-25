import axios from 'axios';
import { API_BASE_URL } from '../constants/apiConstants';
import { extractError } from '../utils/extractError';

// Get autocomplete suggestions
export const searchSuggestions = async (query) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/search/suggestions?q=${encodeURIComponent(query)}`
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

// Get popular events and keywords
export const getPopularSearches = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/search/popular`);
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

// Search events with filters and pagination
export const searchEvents = async (filters) => {
  try {
    const params = new URLSearchParams();

    // Search query
    if (filters.q) params.append('q', filters.q);

    // Filters
    if (filters.category?.length) {
      filters.category.forEach((cat) => params.append('category', cat));
    }
    if (filters.city) params.append('city', filters.city);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.minPrice > 0) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice < 5000000) params.append('maxPrice', filters.maxPrice);

    // Sorting
    if (filters.sortBy) params.append('sortBy', filters.sortBy);

    // Pagination
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await axios.get(
      `${API_BASE_URL}/search/events?${params.toString()}`
    );

    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};
