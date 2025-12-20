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

    console.log('TICKETTYPE của SHOW trả về: ', response.data);
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

    console.log('TICKETS của SHOW trả về: ', response.data);
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};
