import axios from 'axios';
import { API_BASE_URL } from '../constants/apiConstants';
import { extractError } from '../utils/extractError';
import axiosInstance from '../api/axios';

export const getStaffEvents = async (staffId) => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/staff-permissions/staff/${staffId}`
    );
    console.log('STAFF EVENTS: ', response.data);

    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const assignStaff = async (staffId, eventId) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/staff-permissions/assign`,
      { staffId, eventId }
    );
    console.log('ASSIGN STAFF ', response.data);

    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const assignMultipleStaffs = async (staffIds, eventId) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/staff-permissions/assign-multiple-staffs`,
      { staffIds, eventId }
    );
    console.log('ASSIGN MULTIPLE STAFF ', response.data);

    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const assignMultipleEvents = async (staffId, eventIds) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/staff-permissions/assign-multiple-events`,
      { staffId, eventIds }
    );
    console.log('ASSIGN MULTIPLE EVENTS ', response.data);

    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const removeMultipleStaffs = async (staffIds, eventId) => {
  try {
    const response = await axiosInstance.delete(
      `${API_BASE_URL}/staff-permissions/remove-multiple-staffs`,
      { data: { staffIds, eventId } }
    );
    console.log('REMOVE MULTIPLE STAFF ', response.data);

    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const removeMultipleEvents = async (staffId, eventIds) => {
  try {
    const response = await axiosInstance.delete(
      `${API_BASE_URL}/staff-permissions/remove-multiple-events`,
      { data: { staffId, eventIds } }
    );
    console.log('REMOVE MULTIPLE EVENTS ', response.data);

    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};
