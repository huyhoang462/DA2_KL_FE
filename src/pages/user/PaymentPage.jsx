import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSelector, useDispatch } from 'react-redux';
import QRCode from 'react-qr-code';
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

  // --- QR CODE COMPONENT ---
  const QRCodeDisplay = () => (
    <div className="border-border-default bg-background-secondary flex flex-col items-center gap-4 rounded-lg border p-6 text-center">
      <div className="text-center">
        <p className="text-text-primary text-sm font-semibold">
          Mã đơn hàng: <span className="text-primary">{orderId}</span>
        </p>
        <p className="mb-2 text-sm font-medium text-blue-800">
          🏦 Thanh toán qua VNPay
        </p>
        <Button
          onClick={() =>
            window.open(paymentUrl, '_blank', 'noopener,noreferrer')
          }
          variant="default"
        >
          Mở trang thanh toán VNPay
        </Button>
      </div>

      <p className="text-text-secondary text-xs">
        Sau khi thanh toán thành công, trang sẽ tự động cập nhật
      </p>
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

    // Default: hiển thị QR code
    return <QRCodeDisplay />;
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
