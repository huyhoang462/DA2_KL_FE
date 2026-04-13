import axios from 'axios';
import { store } from '../store/store';
import { login, logout } from '../store/slices/authSlice';
import { API_BASE_URL } from '../constants/apiConstants';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, //  trình duyệt tự động gửi cookie (chứa refresh token)
});

let isRefreshing = false;
let pendingRequests = [];

const processPendingRequests = (error, accessToken = null) => {
  pendingRequests.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
      return;
    }
    resolve(accessToken);
  });
  pendingRequests = [];
};

const forceLogout = () => {
  if (store.getState().auth.isAuthenticated) {
    store.dispatch(logout());
  }
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Xử lý khi access token hết hạn
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;
    const requestUrl = originalRequest.url || '';
    const isAuthenticated = store.getState().auth.isAuthenticated;

    const isRefreshRequest = requestUrl.includes('/auth/refresh-token');
    const isLoginRequest =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/staff-login');

    if (status !== 401) {
      return Promise.reject(error);
    }

    // Không cố refresh khi user chưa đăng nhập.
    if (!isAuthenticated) {
      return Promise.reject(error);
    }

    // Nếu chính request refresh bị 401 thì kết thúc phiên luôn, không retry thêm.
    if (isRefreshRequest) {
      forceLogout();
      return Promise.reject(error);
    }

    // Không tự refresh cho login/staff-login để tránh hành vi khó đoán.
    if (isLoginRequest) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // Nếu đã có luồng refresh đang chạy, xếp request hiện tại vào hàng đợi.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({ resolve, reject });
      }).then((newAccessToken) => {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      });
    }

    isRefreshing = true;

    try {
      // axiosInstance.post sẽ tự động thêm cookie `jwt` vào request
      const { data } = await axiosInstance.post('/auth/refresh-token');

      const refreshedUser = data.user || store.getState().auth.user;
      store.dispatch(
        login({
          user: refreshedUser,
          accessToken: data.accessToken,
        })
      );

      processPendingRequests(null, data.accessToken);
      isRefreshing = false;

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      processPendingRequests(refreshError, null);
      forceLogout();
      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;
