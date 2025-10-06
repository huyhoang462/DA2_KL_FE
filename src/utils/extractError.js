export const extractError = (error) => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Đã có lỗi xảy ra';
  const status = error?.response?.status || 500;
  return { message, status };
};
