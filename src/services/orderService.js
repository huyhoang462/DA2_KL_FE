// src/services/orderService.js
import axiosInstance from '../api/axios';
import { API_BASE_URL } from '../constants/apiConstants';
import { extractError } from '../utils/extractError';

// Tạo order và lấy payment URL
const createPayment = async (orderPayload) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/orders/create-payment`, // Sửa endpoint
      orderPayload
    );
    console.log('DATA trả về: ', response.data);

    return response.data; // Trả về data thay vì response
  } catch (error) {
    throw extractError(error);
  }
};

const getMyOrders = async () => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/orders/my-orders`
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

// Kiểm tra trạng thái đơn hàng
const getOrderStatus = async (orderId) => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/orders/${orderId}/status`
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

const finalizeOrder = async (orderData) => {
  const response = await axiosInstance.post(
    '/payment/finalize-order',
    orderData
  );
  return response.data;
};
export const orderService = {
  createPayment,
  getOrderStatus,
  finalizeOrder,
  getMyOrders,
};
