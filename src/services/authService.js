import { API_BASE_URL } from '../constants/apiConstants';
import axios from 'axios';
import axiosInstance from '../api/axios';
import { extractError } from '../utils/extractError';

export const handleLogin = async ({ email, password }) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/auth/login`, {
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
      fullName: formData.name,
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

export const forgotPasswordAPI = async ({ email }) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
      email,
    });
    return res.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const verifyResetCodeAPI = async ({ email, code }) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/auth/verify-reset-code`, {
      email,
      code,
    });
    return res.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const resetPasswordAPI = async ({ email, code, newPassword }) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
      email,
      code,
      newPassword,
    });
    return res.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const handleChangePassword = async ({
  userId,
  oldPassword,
  newPassword,
}) => {
  try {
    const res = await axiosInstance.post(
      `${API_BASE_URL}/auth/change-password`,
      {
        userId,
        oldPassword,
        newPassword,
      }
    );
    return res.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const handleEditProfile = async ({ userId, fullName, phone }) => {
  try {
    const res = await axiosInstance.put(`${API_BASE_URL}/auth/edit-profile`, {
      userId,
      fullName,
      phone,
    });
    return res.data;
  } catch (error) {
    throw extractError(error);
  }
};
