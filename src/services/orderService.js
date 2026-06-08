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
    console.log('ORDERS: ', response.data);

    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

// Lấy danh sách orders của event với filters
const getEventOrders = async (eventId, params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    // Add all filter params
    if (params.search) queryParams.append('search', params.search);
    if (params.status && params.status !== 'all')
      queryParams.append('status', params.status);
    if (params.showId && params.showId !== 'all')
      queryParams.append('showId', params.showId);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const url = `${API_BASE_URL}/events/${eventId}/orders${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

// Lấy chi tiết order
const getOrderDetails = async (orderId) => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/orders/${orderId}/details`
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

// Hủy order
const cancelOrder = async (orderId) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/orders/${orderId}/cancel`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

// Gửi lại payment link
const resendPaymentLink = async (orderId) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/orders/${orderId}/resend-payment`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
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

// (Crypto) API gọi khi mint vé thành công trên Blockchain để BE finalize đơn Web3
// Backend expects: POST /api/payment/finalize-order-web3 with body { orderId, txHash, tokenIds }
const updateOrderMintStatus = async (orderId, mintResult) => {
  try {
    // Extract txHash from possible input shapes (string or object)
    const txHash =
      typeof mintResult === 'string'
        ? mintResult
        : mintResult && mintResult.txHash
          ? mintResult.txHash
          : mintResult && mintResult.hash
            ? mintResult.hash
            : null;

    // Extract tokenIds (mảng số nguyên các tokenId vừa được đúc từ Blockchain)
    const tokenIds =
      mintResult && Array.isArray(mintResult.tokenIds) && mintResult.tokenIds.length > 0
        ? mintResult.tokenIds
        : undefined;

    const payload = { orderId, txHash, ...(tokenIds !== undefined && { tokenIds }) };

    console.log('[orderService] Gửi finalize-order-web3 payload:', payload);

    const response = await axiosInstance.post(
      `${API_BASE_URL}/payment/finalize-order-web3`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

// (VND) API gọi khi thanh toán thành công/thất bại để cập nhật trạng thái order trên backend
const finalizeOrder = async (orderData) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/payment/finalize-order`,
      orderData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};
const createResaleOrder = async (orderPayload) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/payment/create-resale-order`,
      orderPayload
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

const finalizeResaleOrder = async (orderPayload) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/payment/finalize-resale-order`,
      orderPayload
    );
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const orderService = {
  createPayment,
  getOrderStatus,
  finalizeOrder,
  getMyOrders,
  getEventOrders,
  getOrderDetails,
  cancelOrder,
  resendPaymentLink,
  updateOrderMintStatus,
  createResaleOrder,
  finalizeResaleOrder,
};
