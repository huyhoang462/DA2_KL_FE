import { API_BASE_URL } from '../constants/apiConstants';
import axios from 'axios';
import { extractError } from '../utils/extractError';

export const handleLogin = async ({ email, password }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw extractError(error);
  }
};

export const handleRegisterRequest = async ({ formData }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register-request`, {
      email: formData.email,
      password: formData.password,
      name: formData.name,
      phone: formData.phone,
      role: formData.role,
    });
    return response.data;
  } catch (error) {
    console.error('Signup error:', error);
    throw extractError(error);
  }
};

export const handleVerifyEmail = async ({ email, otp }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/verify-email`, {
      email,
      otp,
    });
    return response.data;
  } catch (error) {
    console.error('Verify error:', error);
    throw extractError(error);
  }
};
