// src/utils/broadcastChannel.js

const PAYMENT_CHANNEL_NAME = 'shineticket_payment_channel';
let paymentChannel;

// Hàm khởi tạo để tránh lỗi "ReferenceError: BroadcastChannel is not defined" phía server (nếu có SSR)
const getPaymentChannel = () => {
  if (typeof BroadcastChannel !== 'undefined') {
    if (!paymentChannel) {
      paymentChannel = new BroadcastChannel(PAYMENT_CHANNEL_NAME);
    }
    return paymentChannel;
  }
  return null; // Trả về null nếu không hỗ trợ
};

export const postPaymentResult = (result) => {
  const channel = getPaymentChannel();
  if (channel) {
    channel.postMessage(result);
  }
};

export const listenForPaymentResult = (callback) => {
  const channel = getPaymentChannel();
  if (!channel) return () => {}; // Trả về hàm rỗng nếu không hỗ trợ

  const handler = (event) => {
    callback(event.data);
  };
  channel.addEventListener('message', handler);

  return () => {
    channel.removeEventListener('message', handler);
  };
};
