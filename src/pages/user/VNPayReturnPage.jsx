import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { postPaymentResult } from '../../utils/broadcastChannel';
import { orderService } from '../../services/orderService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function VnpayReturnPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing');
  const [countdown, setCountdown] = useState(3);
  const [errorMessage, setErrorMessage] = useState('');
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const finalizePayment = async () => {
      const responseCode = searchParams.get('vnp_ResponseCode');
      const orderIdParam = searchParams.get('vnp_TxnRef');
      const transactionNo = searchParams.get('vnp_TransactionNo');
      const bankCode = searchParams.get('vnp_BankCode');

      if (!orderIdParam) {
        setStatus('invalid');
        return;
      }

      setOrderId(orderIdParam);

      try {
        console.log('[RETURN] Finalizing order...', orderIdParam);

        const result = await orderService.finalizeOrder({
          orderId: orderIdParam,
          vnp_ResponseCode: responseCode,
          vnp_TransactionNo: transactionNo,
          vnp_BankCode: bankCode,
        });

        console.log('[RETURN] Finalize result:', result);

        // Xử lý theo document
        let paymentStatus;
        if (responseCode === '00') {
          paymentStatus = 'paid';
          // Broadcast cho PaymentPage
          postPaymentResult({
            orderId: orderIdParam,
            status: 'paid',
          });
        } else if (responseCode === '24') {
          paymentStatus = 'cancelled';
        } else {
          paymentStatus = 'failed';
          setErrorMessage(result.failureReason || 'Lỗi thanh toán');
        }

        setStatus(paymentStatus);
      } catch (error) {
        console.error('[RETURN] Error finalizing order:', error);
        setStatus('failed');
      }
    };

    finalizePayment();
  }, [searchParams]);

  // Countdown và xử lý theo document (Bug 2 - Fix)
  useEffect(() => {
    if (status === 'processing' || status === 'invalid') return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      // countdown = 0
      if (status === 'paid') {
        // ✅ Success: Close popup (PaymentPage đã nhận broadcast)
        console.log('[RETURN] Closing popup - payment successful');
        window.close();
      } else if (status === 'cancelled' || status === 'failed') {
        // 🚫 Cancelled/Failed: PostMessage to parent TRƯỚC KHI close
        console.log('[RETURN] Sending postMessage to parent:', status);

        if (window.opener && !window.opener.closed) {
          // Gửi postMessage cho parent
          window.opener.postMessage(
            {
              type: 'PAYMENT_RESULT',
              orderId: orderId,
              status: status,
            },
            window.location.origin
          );

          console.log('[RETURN] Closing popup after sending message');
        }

        // Close popup
        window.close();
      }
    }
  }, [countdown, status, orderId]);

  // --- RENDER (giữ nguyên code UI hiện tại) ---
  return (
    <div className="bg-background-primary flex h-screen flex-col items-center justify-center px-4 text-center">
      {status === 'processing' && (
        <>
          <LoadingSpinner size="lg" />
          <h1 className="text-text-primary mt-6 text-2xl font-bold">
            Đang xử lý thanh toán...
          </h1>
          <p className="text-text-secondary mt-2">
            Vui lòng không đóng tab này
          </p>
        </>
      )}

      {status === 'paid' && (
        <div className="max-w-md">
          <div className="bg-success/10 border-success text-success mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-4">
            <svg
              className="h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-success mb-3 text-2xl font-bold">
            Thanh toán thành công!
          </h1>
          <p className="text-text-secondary mb-6">
            Vé đã được tạo và gửi vào tài khoản.
            <br />
            Tab này sẽ tự động đóng sau{' '}
            <span className="text-lg font-bold">{countdown}</span> giây...
          </p>
        </div>
      )}

      {status === 'cancelled' && (
        <div className="max-w-md">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-4 border-gray-400 bg-gray-100 text-gray-600">
            <svg
              className="h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
          <h1 className="mb-3 text-2xl font-bold text-gray-700">
            Bạn đã hủy thanh toán
          </h1>
          <p className="text-text-secondary mb-6">
            Đơn hàng đã được hủy. Vé đã được trả lại kho.
            <br />
            Đang chuyển hướng trong{' '}
            <span className="text-lg font-bold">{countdown}</span> giây...
          </p>
        </div>
      )}

      {status === 'failed' && (
        <div className="max-w-md">
          <div className="bg-destructive/10 border-destructive text-destructive mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-4">
            <svg
              className="h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-destructive mb-3 text-2xl font-bold">
            Thanh toán không thành công
          </h1>
          {errorMessage && (
            <p className="text-destructive mb-2 font-semibold">
              {errorMessage}
            </p>
          )}
          <p className="text-text-secondary mb-6">
            Đang chuyển hướng trong{' '}
            <span className="text-lg font-bold">{countdown}</span> giây...
          </p>
        </div>
      )}

      {status === 'invalid' && (
        <div className="max-w-md">
          <h1 className="text-warning mb-3 text-2xl font-bold">
            Thông tin không hợp lệ
          </h1>
          <p className="text-text-secondary mb-6">
            Không tìm thấy thông tin giao dịch
          </p>
        </div>
      )}
    </div>
  );
}
