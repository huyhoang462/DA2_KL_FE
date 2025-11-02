import axios from 'axios';

const API_BASE_URL = 'https://provinces.open-api.vn/api/v2';

const getAllProvinces = async () => {
  const response = await axios.get(`${API_BASE_URL}/p`);
  return response.data;
};

const getAllWards = async () => {
  const response = await axios.get(`${API_BASE_URL}/w`);
  return response.data;
};

export const locationService = {
  getAllProvinces,
  getAllWards,
};
