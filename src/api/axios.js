// src/api/axiosInstance.js (Phiên bản nâng cấp cho dự án của bạn)
import axios from 'axios';
import { store } from '../store/store';
// IMPORT các action từ slice của bạn
import { login, logout } from '../store/slices/authSlice';
import { API_BASE_URL } from '../constants/apiConstants';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL || 'http://localhost:3001/api', // Dùng biến môi trường
  withCredentials: true, // QUAN TRỌNG: để trình duyệt tự động gửi cookie (chứa refresh token)
});

// Request Interceptor: Tự động thêm access token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    // Lấy token từ Redux state
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
    const originalRequest = error.config;

    // Kiểm tra nếu lỗi là 401 và request này chưa được thử lại
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Đánh dấu là đã thử lại để tránh vòng lặp vô hạn

      try {
        // Gọi API /refresh-token để lấy access token mới
        // axiosInstance.post sẽ tự động thêm cookie `jwt` vào request
        const { data } = await axiosInstance.post('/auth/refresh-token'); // Khớp với route của bạn
        const newAccessToken = data.accessToken;

        // Lấy thông tin user hiện tại từ store
        const currentUser = store.getState().auth.user;

        // Cập nhật token mới và user vào Redux store bằng action `login` của bạn
        store.dispatch(
          login({ user: currentUser, accessToken: newAccessToken })
        );

        // Cập nhật header cho request gốc và thực hiện lại nó
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Nếu quá trình refresh thất bại (refresh token hết hạn hoặc không hợp lệ)
        // Đăng xuất người dùng
        store.dispatch(logout());

        // (Tùy chọn) Điều hướng về trang đăng nhập
        // window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    // Trả về các lỗi khác (400, 404, 500...)
    return Promise.reject(error);
  }
);

export default axiosInstance;
