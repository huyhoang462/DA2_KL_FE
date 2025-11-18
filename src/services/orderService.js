// src/services/orderService.js

// --- HÀM GIẢ LẬP ---

// Hàm này giả lập việc gọi API để tạo một đơn hàng tạm thời.
// Nó nhận vào payload từ frontend và trả về một ID đơn hàng duy nhất.
const createOrder = (orderPayload) => {
  console.log(
    '[MOCK API] Received createOrder request with payload:',
    orderPayload
  );

  return new Promise((resolve, reject) => {
    // Giả lập độ trễ mạng (ví dụ: 500ms)
    setTimeout(() => {
      // Logic giả lập: 95% thành công, 5% thất bại
      if (Math.random() > 0.05) {
        // Tạo một ID đơn hàng giả ngẫu nhiên
        const mockOrderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        console.log(
          `[MOCK API] Order created successfully. Order ID: ${mockOrderId}`
        );

        // Trả về dữ liệu giống như API thật
        resolve({
          success: true,
          message: 'Order created successfully.',
          orderId: mockOrderId,
        });
      } else {
        // Giả lập lỗi (ví dụ: một trong các loại vé vừa hết)
        console.error('[MOCK API] Failed to create order (simulated error).');
        reject(
          new Error('Một loại vé trong giỏ hàng đã hết. Vui lòng chọn lại.')
        );
      }
    }, 500);
  });
};

// Hàm này giả lập việc hủy một đơn hàng (khi timeout hoặc người dùng rời trang)
const cancelOrder = (orderId) => {
  console.log(
    `[MOCK API] Received cancelOrder request for Order ID: ${orderId}`
  );

  return new Promise((resolve) => {
    // Giả lập độ trễ mạng
    setTimeout(() => {
      // Logic hủy đơn hàng ở backend thường luôn thành công nếu orderId hợp lệ.
      console.log(`[MOCK API] Order ${orderId} has been cancelled.`);
      resolve({
        success: true,
        message: `Order ${orderId} cancelled.`,
      });
    }, 300);
  });
};

// Hàm này giả lập việc người dùng nhấn "Tôi đã thanh toán"
// Ở backend, hàm này sẽ cập nhật status của Order thành "paid" (hoặc "processing")
const confirmPayment = (orderId) => {
  console.log(
    `[MOCK API] Received confirmPayment request for Order ID: ${orderId}`
  );

  return new Promise((resolve, reject) => {
    // Giả lập độ trễ mạng
    setTimeout(() => {
      // Giả lập 98% thành công
      if (Math.random() > 0.02) {
        console.log(`[MOCK API] Payment confirmed for order ${orderId}.`);
        resolve({
          success: true,
          message:
            'Payment confirmation received. Please wait for admin approval.',
        });
      } else {
        console.error(
          '[MOCK API] Failed to confirm payment (simulated error).'
        );
        reject(new Error('Không thể gửi xác nhận. Vui lòng thử lại.'));
      }
    }, 800);
  });
};

// --- EXPORT SERVICE OBJECT ---

export const orderService = {
  createOrder,
  cancelOrder,
  confirmPayment,
};
