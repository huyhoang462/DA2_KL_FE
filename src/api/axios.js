import axios from 'axios';
import { store } from '../store/store';
import { login, logout } from '../store/slices/authSlice';
import { API_BASE_URL } from '../constants/apiConstants';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, //  trình duyệt tự động gửi cookie (chứa refresh token)
});

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
    const originalRequest = error.config;

    // Kiểm tra nếu lỗi là 401 và request này chưa được thử lại
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Đánh dấu là đã thử lại để tránh vòng lặp vô hạn

      try {
        // Gọi API /refresh-token để lấy access token mới
        // axiosInstance.post sẽ tự động thêm cookie `jwt` vào request
        const { data } = await axiosInstance.post('/auth/refresh-token');

        // Nếu BE trả về user, dùng data.user; nếu không, decode token
        let refreshedUser;
        if (data.user) {
          refreshedUser = data.user;
        } else {
          // Fallback: decode token để lấy basic info
          const tokenPayload = JSON.parse(atob(data.accessToken.split('.')[1]));
          const currentUser = store.getState().auth.user;

          // Kiểm tra user ID có khớp không
          if (currentUser && currentUser.id !== tokenPayload.id) {
            console.error('🚨 [Security] User ID mismatch! Force logout.');
            console.error('Expected:', currentUser.id, 'Got:', tokenPayload.id);
            store.dispatch(logout());
            window.location.href = '/login';
            return Promise.reject(new Error('Session mismatch'));
          }
          refreshedUser = currentUser;
        }

        store.dispatch(
          login({
            user: refreshedUser,
            accessToken: data.accessToken,
          })
        );

        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
