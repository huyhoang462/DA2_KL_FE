import axios from 'axios';
import axiosInstance from '../api/axios';
import { API_BASE_URL } from '../constants/apiConstants';
import { extractError } from '../utils/extractError';

export const getAllPosts = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/posts`, {
      params,
    });
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const createPost = async (payload) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/posts`, payload);
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const deletePost = async (postId) => {
  try {
    const response = await axiosInstance.delete(
      `${API_BASE_URL}/posts/${postId}`
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};
