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

  // if (!eventData.startDate) {
  //   errors.startDate = 'Vui lòng chọn ngày bắt đầu.';
  // }
  // if (eventData.startDate && new Date(eventData.startDate) <= new Date()) {
  //   errors.startDate = 'Ngày bắt đầu phải lớn hơn hiện tại.';
  // }
  // if (!eventData.endDate) {
  //   errors.endDate = 'Vui lòng chọn ngày kết thúc.';
  // }
  // if (
  //   eventData.startDate &&
  //   eventData.endDate &&
  //   new Date(eventData.startDate) > new Date(eventData.endDate)
  // ) {
  //   errors.endDate = 'Ngày kết thúc không thể trước ngày bắt đầu.';
  // }

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
  const { shows } = eventData;

  if (!shows || shows.length === 0) {
    errors.shows_general = 'Sự kiện phải có ít nhất 1 suất diễn.';
    return errors;
  }

  const showErrors = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Mảng lưu thông tin về ngày và thời gian của các show để kiểm tra trùng lặp
  const showTimeSlots = [];

  shows.forEach((show, index) => {
    const currentShowErrors = {};

    // Validate tên
    if (!show.name || show.name.trim() === '') {
      currentShowErrors.name = 'Vui lòng nhập tên suất diễn.';
    }

    // Validate date
    if (!show.date) {
      currentShowErrors.date = 'Vui lòng chọn ngày.';
    } else {
      const showDate = new Date(show.date);
      showDate.setHours(0, 0, 0, 0);
      if (showDate < today) {
        currentShowErrors.date = 'Ngày suất diễn phải lớn hơn hôm nay.';
      }
    }

    // Validate startTime
    if (!show.startTime || show.startTime.trim() === '') {
      currentShowErrors.startTime = 'Vui lòng chọn thời gian bắt đầu.';
    }

    // Validate endTime
    if (!show.endTime || show.endTime.trim() === '') {
      currentShowErrors.endTime = 'Vui lòng chọn thời gian kết thúc.';
    }

    // Validate startTime < endTime
    if (show.startTime && show.endTime) {
      if (show.startTime >= show.endTime) {
        currentShowErrors.endTime = 'Giờ kết thúc phải sau giờ bắt đầu.';
      }
    }

    // Validate tickets
    if (!show.tickets || show.tickets.length === 0) {
      currentShowErrors.tickets_general =
        'Suất diễn này phải có ít nhất 1 loại vé.';
    }

    // Nếu không có lỗi về date và time, thêm vào mảng để kiểm tra trùng lặp
    if (
      show.date &&
      show.startTime &&
      show.endTime &&
      !currentShowErrors.date &&
      !currentShowErrors.startTime &&
      !currentShowErrors.endTime
    ) {
      showTimeSlots.push({
        index,
        date: show.date,
        startTime: show.startTime,
        endTime: show.endTime,
      });
    }

    if (Object.keys(currentShowErrors).length > 0) {
      showErrors[index] = currentShowErrors;
    }
  });

  // Kiểm tra trùng lặp thời gian giữa các show cùng ngày
  for (let i = 0; i < showTimeSlots.length; i++) {
    for (let j = i + 1; j < showTimeSlots.length; j++) {
      const slot1 = showTimeSlots[i];
      const slot2 = showTimeSlots[j];

      // Chỉ kiểm tra nếu cùng ngày
      if (slot1.date === slot2.date) {
        // Kiểm tra xem có trùng lặp thời gian không
        const start1 = slot1.startTime;
        const end1 = slot1.endTime;
        const start2 = slot2.startTime;
        const end2 = slot2.endTime;

        // Hai khoảng thời gian trùng nếu:
        // start1 < end2 && start2 < end1
        if (start1 < end2 && start2 < end1) {
          if (!showErrors[slot2.index]) {
            showErrors[slot2.index] = {};
          }
          showErrors[slot2.index].startTime =
            `Thời gian trùng với suất diễn "${shows[slot1.index].name}".`;
        }
      }
    }
  }

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
