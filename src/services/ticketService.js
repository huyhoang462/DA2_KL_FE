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

export const getTicketTypesByShowId = async (showId) => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/tickets/show/${showId}/ticket-types`
    );

    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const getTicketsByShowId = async (showId) => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/tickets/show/${showId}/tickets`
    );

    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

// ⭐ NEW: For Organizer (Desktop)
export const getOrganizerStats = async (showId) => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/tickets/organizer/show/${showId}/stats`
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const getOrganizerTickets = async (showId, filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.ticketTypeId)
      params.append('ticketTypeId', filters.ticketTypeId);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await axiosInstance.get(
      `${API_BASE_URL}/tickets/organizer/show/${showId}/list?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};
