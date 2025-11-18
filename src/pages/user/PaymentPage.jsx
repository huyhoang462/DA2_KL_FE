import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector, useDispatch } from 'react-redux';

import { getEventById } from '../../services/eventService';
import { orderService } from '../../services/orderService';
import { getAdminPaymentMethods } from '../../services/adminService';
import { clearCart } from '../../store/slices/cartSlice';
import useCountdown from '../../hooks/useCountdown';

import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorDisplay from '../../components/ui/ErrorDisplay';
import EventInfoCard from '../../components/features/buyTicket/EventInfoCard';
import CartInfoCard from '../../components/features/buyTicket/CartInfoCard';
import PaymentDetailsCard from '../../components/features/buyTicket/PaymentDetailsCard';
import TimerCard from '../../components/features/buyTicket/TimerCard';

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const cart = useSelector((state) => state.cart);
  const [orderId, setOrderId] = useState(null);
  const orderIdRef = useRef(null);
  const effectRan = useRef(false); // Lá cờ để kiểm soát useEffect

  // --- DATA FETCHING ---
  const { data: event, isLoading: isLoadingEvent } = useQuery({
    queryKey: ['eventForPayment', id],
    queryFn: () => getEventById('691b3399fe38d6fbc82e1705'),
    enabled: !!id,
  });

  const { data: adminPaymentMethods, isLoading: isLoadingAdminInfo } = useQuery(
    {
      queryKey: ['adminPaymentMethods'],
      queryFn: () => getAdminPaymentMethods(),
    }
  );

  // --- LOGIC HỦY ĐƠN HÀNG ---
  const cancelOrderMutation = useMutation({
    mutationFn: (id) => orderService.cancelOrder(id),
    onSuccess: () =>
      console.log(`[CLEANUP] Đã hủy đơn hàng ${orderIdRef.current}`),
    onError: (error) =>
      console.error(`[CLEANUP ERROR] Lỗi khi hủy đơn hàng:`, error),
  });

  const handleTimeoutOrLeave = useCallback(() => {
    if (orderIdRef.current) {
      cancelOrderMutation.mutate(orderIdRef.current);
      orderIdRef.current = null;
    }
    dispatch(clearCart());
    navigate(`/event-detail/${id}`, { replace: true });
  }, [cancelOrderMutation, dispatch, id, navigate]);

  // --- COUNTDOWN ---
  const { minutes, seconds } = useCountdown(10, () => {
    alert('Đã hết thời gian giữ vé.');
    handleTimeoutOrLeave();
  });

  // --- LOGIC TẠO ĐƠN HÀNG ---
  const createOrderMutation = useMutation({
    mutationFn: (orderData) => orderService.createOrder(orderData),
    onSuccess: (data) => {
      console.log('[SUCCESS] Tạo đơn hàng thành công, ID:', data.orderId);
      setOrderId(data.orderId);
      orderIdRef.current = data.orderId;
    },
    onError: (error) => {
      alert(error.message || 'Không thể giữ vé. Vui lòng thử lại.');
      navigate(`/checkout/${id}/select-tickets`);
    },
  });

  // --- EFFECT CHÍNH: Tạo đơn hàng và xử lý cleanup (Phiên bản AN TOÀN) ---
  useEffect(() => {
    // 1. Điều kiện cần: Phải có đủ dữ liệu và giỏ hàng không rỗng
    if (!event || !cart.items || Object.keys(cart.items).length === 0) {
      return;
    }

    // 2. Kiểm tra lá cờ: Chỉ chạy logic nếu đây là lần đầu tiên (hoặc lần thứ 2 trong StrictMode)
    //    `effectRan.current` sẽ là `false` ở lần mount đầu, và `true` ở lần mount thứ hai.
    //    Ở production, nó sẽ luôn là `false` ở lần mount duy nhất.
    if (effectRan.current === false) {
      const orderPayload = {
        eventId: event.id, // Sửa lại thành eventId
        items: Object.entries(cart.items).map(([ticketTypeId, quantity]) => ({
          ticketTypeId,
          quantity,
        })),
      };

      console.log('[EFFECT] Gửi yêu cầu tạo đơn hàng...');
      createOrderMutation.mutate(orderPayload);
    }

    // 3. Đánh dấu là effect đã chạy và đăng ký hàm cleanup
    //    Hàm cleanup này sẽ được đăng ký trong CẢ HAI lần mount của StrictMode.
    return () => {
      // Đánh dấu để lần mount tiếp theo của StrictMode biết mà không chạy lại logic tạo đơn hàng
      effectRan.current = true;

      // Hàm cleanup sẽ chỉ thực thi logic hủy khi orderIdRef.current đã có giá trị.
      // Ở lần unmount đầu tiên của StrictMode, orderIdRef.current có thể vẫn là null
      // nên sẽ không có gì xảy ra, điều này an toàn.
      // Chỉ khi component unmount thật sự, orderIdRef.current đã được set và logic hủy mới chạy.
      if (orderIdRef.current) {
        console.log('[CLEANUP] Component unmount, gửi yêu cầu hủy đơn hàng...');
        cancelOrderMutation.mutate(orderIdRef.current);
      }
    };
  }, [event, cart.items]); // Chỉ phụ thuộc vào dữ liệu, không phụ thuộc vào các hàm mutate

  // --- EFFECT XỬ LÝ RỜI TRANG (Tách riêng cho rõ ràng) ---
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (orderIdRef.current) {
        e.preventDefault();
        e.returnValue = 'Bạn có chắc muốn rời đi? Đơn hàng của bạn sẽ bị hủy.';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []); // Effect này không có phụ thuộc, chỉ chạy 1 lần lúc mount và cleanup 1 lần lúc unmount

  const isLoading = isLoadingEvent || isLoadingAdminInfo;
  if (isLoading) {
    return (
      <div className="bg-background-primary flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!cart.items || Object.keys(cart.items).length === 0) {
    return (
      <ErrorDisplay message="Giỏ hàng của bạn đang trống. Vui lòng chọn vé." />
    );
  }

  if (!event || !adminPaymentMethods || adminPaymentMethods.length === 0) {
    return <ErrorDisplay message="Không thể tải thông tin thanh toán." />;
  }

  return (
    <div className="bg-background-primary min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <TimerCard minutes={minutes} seconds={seconds} />
            <PaymentDetailsCard
              methods={adminPaymentMethods}
              orderId={orderId}
              isCreatingOrder={createOrderMutation.isPending}
            />
          </div>
          <div className="space-y-8 lg:col-span-1">
            <EventInfoCard event={event} />
            <CartInfoCard event={event} />
          </div>
        </div>
      </main>
    </div>
  );
}
