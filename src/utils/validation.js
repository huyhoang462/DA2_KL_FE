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

export const validateBankNumber = (bankNumber) => {
  const re = /^\d{8,14}$/;
  return re.test(bankNumber?.trim());
};

export const validateStepOne = (eventData) => {
  const errors = {};

  if (!eventData.name || eventData.name.trim().length < 5) {
    errors.name = 'Tên sự kiện phải có ít nhất 5 ký tự.';
  }

  if (!eventData.description || eventData.description.trim().length < 20) {
    errors.description = 'Mô tả cần chi tiết hơn, ít nhất 20 ký tự.';
  }

  if (!eventData.bannerImageUrl) {
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

  if (eventData.format === 'offline') {
    const locationInfo = eventData.location || {};
    const locationErros = {};

    if (!locationInfo.province) {
      locationErros.province = 'Vui lòng chọn tỉnh.';
    }

    if (!locationInfo.ward) {
      locationErros.ward = 'Vui lòng chọn xã';
    }

    if (!locationInfo.street || locationInfo.street.trim() === '') {
      locationErros.street = 'Vui lòng nhập địa chỉ cụ thể';
    }
    if (Object.keys(locationErros).length > 0) {
      errors.location = locationErros;
    }
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

export const validateTicketType = (data) => {
  const errors = {};
  if (!data.name || data.name.trim().length < 3) {
    errors.name = 'Tên vé phải có ít nhất 3 ký tự.';
  }
  if (!data.price || data.price < 0) {
    errors.price = 'Giá vé không hợp lệ.';
  }
  if (!data.quantityTotal || data.quantityTotal < 1) {
    errors.quantityTotal = 'Số lượng vé phải lớn hơn 0.';
  }
  if (data.minPurchase < 1) {
    errors.minPurchase = 'Mua tối thiểu phải lớn hơn 0.';
  }
  if (data.maxPurchase < data.minPurchase) {
    errors.maxPurchase = 'Mua tối đa phải lớn hơn hoặc bằng mức tối thiểu.';
  }
  return errors;
};

export const validateStepTwo = (eventData) => {
  const errors = {};
  const { shows, startDate, endDate } = eventData;

  if (!shows || shows.length === 0) {
    errors.shows_general = 'Sự kiện phải có ít nhất 1 suất diễn.';
    return errors;
  }

  const showErrors = [];

  const eventStartDate = startDate
    ? new Date(startDate).setHours(0, 0, 0, 0)
    : null;
  const eventEndDate = endDate
    ? new Date(endDate).setHours(23, 59, 59, 999)
    : null;

  shows.forEach((show, index) => {
    const currentShowErrors = {};
    const showStartTime = show.startTime ? new Date(show.startTime) : null;
    const showEndTime = show.endTime ? new Date(show.endTime) : null;

    if (!show.name || show.name.trim() === '') {
      currentShowErrors.name = 'Vui lòng nhập tên suất diễn.';
    }

    if (!showStartTime) {
      currentShowErrors.startTime = 'Vui lòng chọn thời gian bắt đầu.';
    }
    if (!showEndTime) {
      currentShowErrors.endTime = 'Vui lòng chọn thời gian kết thúc.';
    }

    if (showStartTime && showEndTime && showStartTime >= showEndTime) {
      currentShowErrors.endTime = 'Giờ kết thúc phải sau giờ bắt đầu.';
    }
    if (eventStartDate && showStartTime && showStartTime < eventStartDate) {
      currentShowErrors.startTime =
        'Không thể bắt đầu trước ngày bắt đầu của sự kiện.';
    }
    if (eventEndDate && showEndTime && showEndTime > eventEndDate) {
      currentShowErrors.endTime =
        'Không thể kết thúc sau ngày kết thúc của sự kiện.';
    }

    if (!show.tickets || show.tickets.length === 0) {
      currentShowErrors.tickets_general =
        'Suất diễn này phải có ít nhất 1 loại vé.';
    }

    if (Object.keys(currentShowErrors).length > 0) {
      showErrors[index] = currentShowErrors;
    }
  });

  if (showErrors.length > 0) {
    errors.shows = showErrors;
  }

  return errors;
};

export const validateStepThree = (eventData) => {
  const errors = {};
  const { payoutMethod } = eventData;
  if (payoutMethod.methodType === 'bank_account') {
    const bankErrors = {};
    const { bankDetails } = payoutMethod;
    if (!bankDetails.bankName || bankDetails.bankName.trim() === '')
      bankErrors.bankName = 'Vui lòng chọn một ngân hàng.';
    if (!bankDetails.accountNumber || bankDetails.accountNumber.trim() === '')
      bankErrors.accountNumber = 'Vui lòng nhập số tài khoản.';
    else if (!validateBankNumber(bankDetails.accountNumber))
      bankErrors.accountNumber = 'Số tài khoản không hợp lệ';
    if (!bankDetails.accountName || bankDetails.accountName.trim() === '')
      bankErrors.accountName = 'Vui lòng nhập tên chủ tài khoản.';
    if (Object.keys(bankErrors).length > 0) {
      errors.bankDetails = bankErrors;
    }
  } else if (payoutMethod.methodType === 'momo') {
    const momoErrors = {};
    const { momoDetails } = payoutMethod;
    if (!momoDetails.phoneNumber || momoDetails.phoneNumber.trim() === '')
      momoErrors.phoneNumber = 'Vui lòng nhập số điện thoại.';
    else if (!validatePhone(momoDetails.phoneNumber))
      momoErrors.phoneNumber = 'Số điện thoại không hợp lệ.';
    if (!momoDetails.accountName || momoDetails.accountName.trim() === '')
      momoErrors.accountName = 'Vui lòng nhập tên chủ ví.';
    if (Object.keys(momoErrors).length > 0) {
      errors.momoDetails = momoErrors;
    }
  }

  return errors;
};
