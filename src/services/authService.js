import { API_BASE_URL } from '../constants/apiConstants';
import axios from 'axios';

export const handleLogin = async ({ email, password }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    });
    console.log('response', response);

    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error.response;
  }
};
