import axios from 'axios';
import axiosInstance from '../api/axios';
import { API_BASE_URL } from '../constants/apiConstants';
import { extractError } from '../utils/extractError';

export const getCommentsByPostId = async (postId, params = {}) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/posts/${postId}/comments`,
      {
        params,
      }
    );

    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const createComment = async (postId, payload) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/posts/${postId}/comments`,
      payload
    );

    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const updateComment = async (commentId, payload) => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/comments/${commentId}`,
      payload
    );

    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const deleteComment = async (commentId) => {
  try {
    const response = await axiosInstance.delete(
      `${API_BASE_URL}/comments/${commentId}`
    );

    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};
