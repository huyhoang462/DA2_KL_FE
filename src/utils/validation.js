export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};
export const validatePassword = (password) => {
  const re =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return re.test(password);
};

export const validatePhone = (phone) => {
  const re = /^(?:\+84|84|0)?\d{9,15}$/;
  return re.test(phone);
};

export const validateStepOne = (eventData) => {
  const errors = {};

  if (!eventData.name || eventData.name.trim().length < 5) {
    errors.name = 'Tên sự kiện phải có ít nhất 5 ký tự.';
  }

  if (!eventData.description || eventData.description.trim().length < 20) {
    errors.description = 'Mô tả cần chi tiết hơn, ít nhất 20 ký tự.';
  }

  if (!eventData.bannerImage) {
    errors.bannerImage = 'Vui lòng tải lên ảnh bìa cho sự kiện.';
  }

  if (!eventData.category) {
    errors.category = 'Vui lòng chọn một danh mục.';
  }

  if (!eventData.startDate) {
    errors.startDate = 'Vui lòng chọn ngày bắt đầu.';
  }
  if (eventData.startDate && new Date(eventData.startDate) <= new Date()) {
    errors.startDate = 'Ngày bắt đầu phải lớn hơn hiện tại.';
  }
  if (!eventData.endDate) {
    errors.endDate = 'Vui lòng chọn ngày kết thúc.';
  }
  if (
    eventData.startDate &&
    eventData.endDate &&
    new Date(eventData.startDate) > new Date(eventData.endDate)
  ) {
    errors.endDate = 'Ngày kết thúc không thể trước ngày bắt đầu.';
  }

  const organizerInfo = eventData.organizer || {};
  const organizerErrors = {};

  if (!organizerInfo.name || organizerInfo.name.trim() === '') {
    organizerErrors.name = 'Vui lòng nhập tên nhà tổ chức.';
  }

  if (!organizerInfo.email || organizerInfo.email.trim() === '') {
    organizerErrors.email = 'Vui lòng nhập email nhà tổ chức.';
  }

  if (!organizerInfo.phone || organizerInfo.phone.trim() === '') {
    organizerErrors.phone = 'Vui lòng nhập số điện thoại nhà tổ chức.';
  }

  const emailError = validateEmail(organizerInfo.email);
  if (!emailError) {
    organizerErrors.email = 'Email không hợp lệ.';
  }

  const phoneError = validatePhone(organizerInfo.phone);
  if (!phoneError) {
    organizerErrors.phone = 'Số điện thoại không hợp lệ.';
  }

  if (Object.keys(organizerErrors).length > 0) {
    errors.organizer = organizerErrors;
  }

  return errors;
};
