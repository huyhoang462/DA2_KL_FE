// src/services/staffService.js
import axiosInstance from '../api/axios';
import { API_BASE_URL } from '../constants/apiConstants';

/**
 * Lấy danh sách tất cả nhân viên do người dùng hiện tại tạo ra.
 */
const getMyStaff = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/user`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tải danh sách nhân viên:', error);
    throw error.response?.data || error;
  }
};

/**
 * Tạo một tài khoản nhân viên mới.
 * @param {object} staffData - Dữ liệu nhân viên { fullName, email, password }.
 */
const createStaff = async (staffData) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/user`,
      staffData
    );
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tạo nhân viên:', error);
    throw error.response?.data || error;
  }
};

/**
 * Cập nhật thông tin của một nhân viên.
 * @param {string} staffId - ID của nhân viên cần cập nhật.
 * @param {object} updatedData - Dữ liệu cần cập nhật { fullName, phone }.
 */
const updateStaff = async (staffId, updatedData) => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/user/${staffId}`,
      updatedData
    );
    return response.data;
  } catch (error) {
    console.error('Lỗi khi cập nhật nhân viên:', error);
    throw error.response?.data || error;
  }
};

/**
 * Xóa một tài khoản nhân viên.
 * @param {string} staffId - ID của nhân viên cần xóa.
 */
const deleteStaff = async (staffId) => {
  try {
    const response = await axiosInstance.delete(
      `${API_BASE_URL}/user/${staffId}`
    );
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xóa nhân viên:', error);
    throw error.response?.data || error;
  }
};

/**
 * Cập nhật danh sách sự kiện mà một nhân viên được phép check-in.
 * (Hàm này bạn sẽ làm logic BE sau, FE sẽ chuẩn bị sẵn)
 * @param {string} staffId - ID của nhân viên.
 * @param {string[]} eventIds - Mảng các ID sự kiện.
 */
const assignEventsToStaff = async (staffId, eventIds) => {
  try {
    console.log(
      `[MOCK] Gán ${eventIds.length} sự kiện cho nhân viên ${staffId}`
    );
    // Giả lập API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    // const response = await axiosInstance.put(`/staff/${staffId}/assign-events`, { eventIds });
    return { success: true };
  } catch (error) {
    console.error('Lỗi khi gán sự kiện:', error);
    throw error.response?.data || error;
  }
};

export const userService = {
  getMyStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  assignEventsToStaff,
};
