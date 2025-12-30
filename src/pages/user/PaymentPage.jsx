import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSelector, useDispatch } from 'react-redux';
import { listenForPaymentResult } from '../../utils/broadcastChannel';

import { getEventById } from '../../services/eventService';
import { orderService } from '../../services/orderService';
import { clearCart } from '../../store/slices/cartSlice';
import useCountdown from '../../hooks/useCountdown';

import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorDisplay from '../../components/ui/ErrorDisplay';
import TimerCard from '../../components/features/buyTicket/TimerCard';
import CartInfoCard from '../../components/features/buyTicket/CartInfoCard';
import Button from '../../components/ui/Button';
import { CreditCard, AlertCircle, ExternalLink } from 'lucide-react';

export default function PaymentPage() {
  const { id, showId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);

  const hasInitialized = useRef(false);
  const pollingInterval = useRef(null);

  const [paymentUrl, setPaymentUrl] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [expiresAt, setExpiresAt] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');

  const { data: event, isLoading: isLoadingEvent } = useQuery({
    queryKey: ['eventForPayment', id],
    queryFn: () => getEventById(id),
    enabled: !!id,
  });

  const handleTimeout = () => {
    setPaymentStatus('expired');
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };

  const getTimeLeft = () => {
    if (!expiresAt) return 15 * 60;
    const now = new Date();
    const expires = new Date(expiresAt);
    return Math.max(0, Math.floor((expires - now) / 1000));
  };

  const { minutes, seconds } = useCountdown(getTimeLeft(), handleTimeout);

  const createPaymentMutation = useMutation({
    mutationFn: (orderData) => orderService.createPayment(orderData),
    onSuccess: (data) => {
      console.log('[SUCCESS] Tạo link thanh toán thành công:', data);
      setPaymentUrl(data.paymentUrl);
      setOrderId(data.orderId);
      setTotalAmount(data.totalAmount);
      setExpiresAt(data.expiresAt);
      startPolling(data.orderId);
    },
    onError: (error) => {
      console.error('[ERROR] Lỗi khi tạo link thanh toán:', error);
      alert(
        error.message || 'Không thể tạo phiên thanh toán. Vui lòng thử lại.'
      );
      navigate(`/event-detail/${id}`);
    },
  });

  const startPolling = (orderIdToCheck) => {
    if (pollingInterval.current) clearInterval(pollingInterval.current);

    pollingInterval.current = setInterval(async () => {
      try {
        const response = await orderService.getOrderStatus(orderIdToCheck);
        const { status } = response;
        if (
          status === 'paid' ||
          status === 'failed' ||
          status === 'cancelled'
        ) {
          setPaymentStatus(status);
          clearInterval(pollingInterval.current);
          pollingInterval.current = null;
        }
      } catch (error) {
        console.error('[POLLING ERROR]', error);
      }
    }, 5000);
  };

  useEffect(() => {
    if (!orderId) return;

    const unsubscribe = listenForPaymentResult((result) => {
      console.log('[BROADCAST] Nhận được kết quả:', result);
      if (result.orderId === orderId) {
        setPaymentStatus(result.status);
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
          pollingInterval.current = null;
        }
      }
    });

    return () => unsubscribe();
  }, [orderId]);

  useEffect(() => {
    if (
      event &&
      cart.items &&
      Object.keys(cart.items).length > 0 &&
      !hasInitialized.current &&
      !createPaymentMutation.isPending
    ) {
      hasInitialized.current = true;
      const orderPayload = {
        eventId: event.id,
        showId: showId,
        items: Object.entries(cart.items).map(([ticketTypeId, quantity]) => ({
          ticketTypeId,
          quantity,
        })),
      };
      createPaymentMutation.mutate(orderPayload);
    }
  }, [event, cart.items, showId, createPaymentMutation]);

  useEffect(() => {
    if (paymentStatus === 'paid') {
      console.log('🎉 Payment successful for order:', orderId);

      // Clear cart
      dispatch(clearCart());

      // Stop polling
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }

      // Navigate to tickets page sau 2 giây
      setTimeout(() => {
        navigate(`/user/tickets`); // Hoặc `/order/${orderId}` để xem chi tiết
      }, 2000);
    }
  }, [paymentStatus, dispatch, navigate, orderId]);

  useEffect(() => {
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, []);

  // --- RENDER LOGIC ---
  if (isLoadingEvent) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!cart.items || Object.keys(cart.items).length === 0) {
    return (
      <ErrorDisplay message="Giỏ hàng của bạn đang trống. Vui lòng chọn vé." />
    );
  }

  if (!event) {
    return <ErrorDisplay message="Không thể tải thông tin sự kiện." />;
  }

  // --- PAYMENT DISPLAY COMPONENT ---
  const PaymentDisplay = () => (
    <div className="bg-background-secondary border-border-default space-y-6 rounded-xl border p-8 shadow-lg">
      <div className="text-center">
        <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <CreditCard className="h-8 w-8" />
        </div>
        <h2 className="text-text-primary mb-2 text-2xl font-bold">
          Thanh toán qua VNPay
        </h2>
        <p className="text-text-secondary text-sm">
          Mã đơn hàng:{' '}
          <span className="text-primary font-mono font-semibold">
            {orderId}
          </span>
        </p>
      </div>

      <div className="border-border-subtle border-t"></div>

      <div className="space-y-4">
        <div className="bg-background-primary rounded-lg p-4">
          <h3 className="text-text-primary mb-3 text-sm font-semibold">
            Hướng dẫn thanh toán:
          </h3>
          <ol className="text-text-secondary space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary font-semibold">1.</span>
              <span>Nhấn nút bên dưới để mở trang thanh toán VNPay</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-semibold">2.</span>
              <span>Điền thông tin thanh toán</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-semibold">3.</span>
              <span>Nhập mã OTP và hoàn tất thanh toán</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-semibold">4.</span>
              <span>
                Trang này sẽ tự động cập nhật sau khi thanh toán thành công
              </span>
            </li>
          </ol>
        </div>

        <Button
          onClick={() =>
            window.open(paymentUrl, '_blank', 'noopener,noreferrer')
          }
          variant="default"
          className="w-full py-6 text-lg font-semibold"
        >
          <ExternalLink className="mr-2 h-5 w-5" />
          Mở trang thanh toán VNPay
        </Button>

        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600" />
          <div className="text-sm">
            <p className="font-medium text-blue-900">Lưu ý quan trọng:</p>
            <ul className="mt-1 space-y-1 text-xs text-blue-800">
              <li>• Không đóng trang này cho đến khi thanh toán hoàn tất</li>
              <li>
                • Phiên thanh toán có hiệu lực trong {minutes}:
                {seconds.toString().padStart(2, '0')} phút
              </li>
              <li>• Sau khi thanh toán, trang sẽ tự động chuyển hướng</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  // --- RENDER CONTENT ---
  const renderContent = () => {
    if (createPaymentMutation.isPending) {
      return (
        <div className="flex items-center justify-center py-10">
          <LoadingSpinner />
          <span className="ml-4">Đang tạo đơn hàng và giữ vé cho bạn...</span>
        </div>
      );
    }

    if (createPaymentMutation.isError) {
      return (
        <div className="text-destructive py-10 text-center">
          <p>Có lỗi xảy ra khi tạo đơn hàng</p>
          <button
            onClick={() => navigate(`/event-detail/${id}`)}
            className="bg-primary mt-4 rounded px-4 py-2 text-white"
          >
            Quay lại
          </button>
        </div>
      );
    }

    if (paymentStatus === 'paid') {
      return (
        <div className="bg-background-primary flex h-screen flex-col items-center justify-center px-4 text-center">
          <div className="max-w-md">
            <div className="bg-success/10 border-success text-success mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4">
              <svg
                className="h-16 w-16"
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
            <h1 className="text-success mb-4 text-3xl font-bold">
              Thanh toán thành công!
            </h1>
            <p className="text-text-secondary mb-2">
              Mã đơn hàng:{' '}
              <span className="text-primary font-mono font-semibold">
                {orderId}
              </span>
            </p>
            <p className="text-text-secondary mb-6">
              Vé của bạn đã được tạo và gửi vào tài khoản.
              <br />
              Đang chuyển hướng đến trang vé...
            </p>
            <LoadingSpinner />
          </div>
        </div>
      );
    }

    if (paymentStatus === 'failed') {
      return (
        <div className="text-destructive py-10 text-center">
          <h2 className="mb-4 text-2xl font-bold">❌ Thanh toán thất bại</h2>
          <p>Vui lòng thử lại hoặc chọn phương thức thanh toán khác</p>
          <button
            onClick={() => navigate(`/event-detail/${id}`)}
            className="bg-primary mt-4 rounded px-4 py-2 text-white"
          >
            Thử lại
          </button>
        </div>
      );
    }

    if (paymentStatus === 'expired') {
      return (
        <div className="text-destructive py-10 text-center">
          <h2 className="mb-4 text-2xl font-bold">
            ⏰ Phiên thanh toán đã hết hạn
          </h2>
          <p>Vui lòng tạo đơn hàng mới</p>
          <button
            onClick={() => navigate(`/event-detail/${id}`)}
            className="bg-primary mt-4 rounded px-4 py-2 text-white"
          >
            Tạo đơn hàng mới
          </button>
        </div>
      );
    }

    // Default: hiển thị payment display
    return <PaymentDisplay />;
  };

  return (
    <div className="bg-background-primary">
      <header className="border-border-subtle bg-background-secondary container mx-auto rounded-xl border-b py-6">
        <div className="flex flex-col items-center px-4">
          <div className="mb-6">
            <TimerCard minutes={minutes} seconds={seconds} />
          </div>
          <p className="text-text-secondary text-sm">
            Hoàn tất thanh toán trong thời gian còn lại để giữ vé của bạn
          </p>
        </div>
      </header>

      <main className="container mx-auto py-8 pb-8 md:pb-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="space-y-8 lg:col-span-3">{renderContent()}</div>

          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-8">
              <CartInfoCard event={event} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
