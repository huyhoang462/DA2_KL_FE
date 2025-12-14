import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { postPaymentResult } from '../../utils/broadcastChannel';
import { orderService } from '../../services/orderService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function VnpayReturnPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const finalizePayment = async () => {
      const responseCode = searchParams.get('vnp_ResponseCode');
      const orderId = searchParams.get('vnp_TxnRef');
      const transactionNo = searchParams.get('vnp_TransactionNo');
      const bankCode = searchParams.get('vnp_BankCode');

      if (!orderId) {
        setStatus('invalid');
        return;
      }

      try {
        // ✅ GỌI API TẠO VÉ + UPDATE STATUS
        console.log('[RETURN] Finalizing order...', orderId);

        const result = await orderService.finalizeOrder({
          orderId,
          vnp_ResponseCode: responseCode,
          vnp_TransactionNo: transactionNo,
          vnp_BankCode: bankCode,
        });

        console.log('[RETURN] Finalize result:', result);

        // Broadcast kết quả đến PaymentPage
        const paymentStatus = responseCode === '00' ? 'paid' : 'failed';
        postPaymentResult({
          orderId: orderId,
          status: paymentStatus,
        });

        setStatus(responseCode === '00' ? 'success' : 'failed');
      } catch (error) {
        console.error('[RETURN] Error finalizing order:', error);

        // Vẫn broadcast để PaymentPage biết
        postPaymentResult({
          orderId: orderId,
          status: 'failed',
        });

        setStatus('failed');
      }

      // Tự động đóng tab sau 3 giây
      setTimeout(() => {
        window.close();
      }, 3000);
    };

    finalizePayment();
  }, [searchParams]);

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

      {status === 'success' && (
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
            Tab này sẽ tự động đóng sau 3 giây...
          </p>
          {/* <button
            onClick={() => window.close()}
            className="bg-success hover:bg-success/90 rounded-lg px-6 py-2 text-white transition-colors"
          >
            Đóng tab ngay
          </button> */}
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
          <p className="text-text-secondary mb-6">
            Tab này sẽ tự động đóng sau 3 giây...
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
