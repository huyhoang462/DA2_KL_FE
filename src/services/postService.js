import axios from 'axios';
import { ethers } from 'ethers';
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

export const getPostById = async (postId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/posts/${postId}`);
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

export const requestGasFund = async (walletAddress) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/gas/fund`, {
      walletAddress,
    });
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const waitForGasFunding = async (walletAddress, maxWaitTime = 30000) => {
  console.log(
    `[GAS FUNDING] Waiting for gas to be deposited into ${walletAddress}...`
  );

  if (!window.ethereum) {
    throw new Error(
      'Không tìm thấy ví Web3. Vui lòng cài đặt MetaMask hoặc kết nối ví Privy.'
    );
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const startTime = Date.now();
  const minGasBalance = ethers.parseEther('0.01');
  const pollInterval = 2000; // Poll every 2 seconds
  let pollCount = 0;

  while (Date.now() - startTime < maxWaitTime) {
    try {
      const balance = await provider.getBalance(walletAddress);
      pollCount++;
      console.log(
        `[GAS FUNDING] Poll #${pollCount}: Balance = ${ethers.formatEther(balance)} ETH`
      );

      if (balance >= minGasBalance) {
        console.log(
          `[GAS FUNDING] ✅ Gas received! Balance: ${ethers.formatEther(balance)} ETH`
        );
        return true;
      }
    } catch (error) {
      console.error('[GAS FUNDING] Error checking balance:', error);
    }

    // Wait before polling again
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  throw new Error(
    `Gas funding timeout - account chưa nhận được gas sau ${maxWaitTime / 1000} giây`
  );
};
