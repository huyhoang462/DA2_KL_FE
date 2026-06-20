import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSelector, useDispatch } from 'react-redux';
import { listenForPaymentResult } from '../../utils/broadcastChannel';

import { getEventById } from '../../services/eventService';
import { orderService } from '../../services/orderService';
import { clearCart } from '../../store/slices/cartSlice';
import useCountdown from '../../hooks/useCountdown';
import { useBuyTicketWeb3 } from '../../hooks/useBuyTicketWeb3';
import useUsdtVndRate from '../../hooks/useUsdtVndRate';

import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorDisplay from '../../components/ui/ErrorDisplay';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { toast } from 'react-toastify';
import TimerCard from '../../components/features/buyTicket/TimerCard';
import CartInfoCard from '../../components/features/buyTicket/CartInfoCard';
import Button from '../../components/ui/Button';
import { CreditCard, AlertCircle, ExternalLink, Wallet } from 'lucide-react';

const normalizePlan = (plan) => {
  if (!plan) return null;

  const quantity =
    plan.quantity ?? plan.ticketQuantity ?? plan.totalQuantity ?? null;
  const totalPrice =
    plan.totalPrice ?? plan.totalAmount ?? plan.totalAmountUsdt ?? null;
  const totalPriceVnd =
    plan.totalPriceVnd ??
    plan.totalAmountVnd ??
    plan.totalAmountVND ??
    plan.totalVnd ??
    null;

  return {
    ...plan,
    quantity,
    totalPrice,
    totalPriceVnd,
  };
};

const displayValue = (value) =>
  value === null || value === undefined || value === '' ? 'N/A' : String(value);

export default function PaymentPage() {
  const { id, showId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);

  const hasInitialized = useRef(false);
  const pollingInterval = useRef(null);
  const finalizeOnceRef = useRef(false);

  const [paymentUrl, setPaymentUrl] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [paymentPlans, setPaymentPlans] = useState({ web3: null, vnd: null });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('web3');
  const [paymentFlowMethod, setPaymentFlowMethod] = useState('web3');
  const [expiresAt, setExpiresAt] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [paymentError, setPaymentError] = useState('');
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncTxHash, setSyncTxHash] = useState(null);
  const [isResyncing, setIsResyncing] = useState(false);

  const { data: exchangeRateVndPerUsdt } = useUsdtVndRate();
  const { isProcessing, statusMessage, handleBuyWithWeb3 } = useBuyTicketWeb3();

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
      console.log('[SUCCESS] Tạo payment plans thành công:', data);

      const baseOrderParams = {
        totalPrice: data.order?.totalAmountUsdt || null,
        totalPriceVnd: data.order?.totalAmountVnd || null,
        quantity:
          data.order?.items?.reduce((acc, item) => acc + item.quantity, 0) ||
          null,
        totalAmount: data.order?.totalAmountUsdt || null,
        totalAmountVnd: data.order?.totalAmountVnd || null,
      };

      const rawWeb3Plan = data.cryptoConfig || data.paymentPlans?.web3 || null;
      const rawVndPlan = data.vndConfig || data.paymentPlans?.vnd || null;

      const web3Plan = normalizePlan(
        rawWeb3Plan ? { ...baseOrderParams, ...rawWeb3Plan } : null
      );
      const vndPlan = normalizePlan(
        rawVndPlan ? { ...baseOrderParams, ...rawVndPlan } : null
      );

      setPaymentPlans({ web3: web3Plan, vnd: vndPlan });
      setSelectedPaymentMethod(vndPlan ? 'vnd' : 'web3');
      setPaymentFlowMethod(vndPlan ? 'vnd' : 'web3');
      setPaymentUrl(
        vndPlan?.paymentUrl ||
          data.vndConfig?.paymentUrl ||
          data.paymentUrl ||
          ''
      );
      setOrderId(data.order?.orderId || data.orderId || null);
      setExpiresAt(data.order?.expiresAt || data.expiresAt || null);
      setPaymentError('');

      const orderIdToPoll = data.order?.orderId || data.orderId;
      if (orderIdToPoll) {
        startPolling(orderIdToPoll);
      }
    },
    onError: (error) => {
      console.error('[ERROR] Lỗi khi tạo payment:', error);
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
      !event ||
      !cart.items ||
      Object.keys(cart.items).length === 0 ||
      hasInitialized.current ||
      createPaymentMutation.isPending
    ) {
      return;
    }

    if (!showId) {
      setPaymentError('Thiếu showId để tạo phiên thanh toán.');
      return;
    }

    if (!exchangeRateVndPerUsdt) {
      return;
    }

    hasInitialized.current = true;
    // Build items array including onChainId when available so backend receives
    // a single source-of-truth for on-chain operations (cartItems[].onChainId)
    const allTickets = event.shows?.flatMap((s) => s.tickets) || [];
    const orderPayload = {
      eventId: event.id,
      showId,
      exchangeRateVndPerUsdt,
      items: Object.entries(cart.items).map(([ticketTypeId, quantity]) => {
        const ticket = allTickets.find((t) => (t._id || t.id) === ticketTypeId);
        return {
          ticketTypeId,
          onChainId: ticket?.onChainId ?? ticket?.onChainIdNumber ?? null,
          quantity,
        };
      }),
    };

    createPaymentMutation.mutate(orderPayload);
  }, [
    event,
    cart.items,
    showId,
    exchangeRateVndPerUsdt,
    createPaymentMutation,
  ]);

  useEffect(() => {
    if (paymentStatus !== 'paid' || finalizeOnceRef.current) {
      return;
    }

    finalizeOnceRef.current = true;

    const handlePaid = async () => {
      try {
        if (paymentFlowMethod === 'vnd' && paymentPlans.vnd?.workerPayload) {
          console.log(
            '[FINALIZE] Chuẩn bị gọi API finalizeOrder với paymentPlans.vnd:',
            paymentPlans.vnd
          );
          const finalizeData = {
            orderId,
            workerPayload: paymentPlans.vnd.workerPayload,
            paymentPlan: paymentPlans.vnd,
            contractCall: paymentPlans.vnd.contractCall,
            buyerAddress:
              paymentPlans.vnd.buyerAddress ||
              paymentPlans.vnd.recipient ||
              null,
            recipient: paymentPlans.vnd.recipient || null,
          };

          console.log(
            '[PaymentPage] Gọi api finalizeOrder với data:',
            finalizeData
          );

          await orderService.finalizeOrder(finalizeData);
        }

        dispatch(clearCart());

        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
          pollingInterval.current = null;
        }

        setTimeout(() => {
          navigate('/user/tickets');
        }, 2000);
      } catch (error) {
        finalizeOnceRef.current = false;
        console.error('[FINALIZE ERROR]', error);
        setPaymentError(error.message || 'Không thể hoàn tất xử lý đơn hàng.');
      }
    };

    handlePaid();
  }, [
    paymentStatus,
    paymentFlowMethod,
    paymentPlans.vnd,
    orderId,
    dispatch,
    navigate,
  ]);

  useEffect(() => {
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, []);

  const totalQuantityFromPlan =
    paymentPlans.web3?.quantity ?? paymentPlans.vnd?.quantity;
  const activePlan =
    selectedPaymentMethod === 'web3' ? paymentPlans.web3 : paymentPlans.vnd;
  const displayTotalPriceVnd =
    activePlan?.totalPriceVnd ??
    (activePlan?.totalPrice != null && exchangeRateVndPerUsdt
      ? Number(activePlan.totalPrice) * Number(exchangeRateVndPerUsdt)
      : null);

  const handleWeb3Checkout = async () => {
    if (!event || !orderId || !paymentPlans.web3) return;

    setPaymentFlowMethod('web3');

    try {
      const txHash = await handleBuyWithWeb3({
        eventId: event.id,
        quantity: totalQuantityFromPlan,
        orderId,
        recipient: paymentPlans.web3.recipient,
        buyerAddress: paymentPlans.web3.buyerAddress,
        web3Plan: paymentPlans.web3,
      });

      setPaymentStatus('paid');
      toast.success('Mua vé thành công!');
      navigate('/user/tickets');
    } catch (error) {
      console.error('Web3 Checkout failed:', error);
      if (error?.code === 'SYNC_PENDING') {
        // Transaction succeeded on-chain but backend didn't confirm
        setSyncTxHash(error.txHash || null);
        setShowSyncModal(true);
        setPaymentError(
          'Giao dịch đã thành công trên Blockchain nhưng hệ thống đang nghẽn mạch cập nhật. Vui lòng Đồng bộ lại hoặc liên hệ Support.'
        );
      } else if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        setPaymentError('Bạn đã từ chối giao dịch trên ví.');
      } else {
        setPaymentError(error.message || 'Thanh toán Web3 thất bại.');
      }
    }
  };

  const handleResync = async () => {
    if (!syncTxHash || !orderId) return;
    setIsResyncing(true);
    try {
      const resp = await orderService.updateOrderMintStatus(orderId, {
        txHash: syncTxHash,
      });
      setShowSyncModal(false);
      setPaymentError('');
      toast.success('Đồng bộ thành công! Vé đã được cập nhật.');
      setPaymentStatus('paid');
      dispatch(clearCart());
      navigate('/user/tickets');
    } catch (err) {
      console.error('Resync failed', err);
      toast.error('Đồng bộ thất bại. Vui lòng thử lại hoặc liên hệ Support.');
    } finally {
      setIsResyncing(false);
    }
  };

  if (isLoadingEvent) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // if (!cart.items || Object.keys(cart.items).length === 0) {
  //   return (
  //     <ErrorDisplay message="Giỏ hàng của bạn đang trống. Vui lòng chọn vé." />
  //   );
  // }

  if (!event) {
    return <ErrorDisplay message="Không thể tải thông tin sự kiện." />;
  }

  const PaymentDisplay = () => (
    <div className="bg-background-secondary border-border-default space-y-6 rounded-xl border p-8 shadow-lg">
      <div className="text-center">
        <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <CreditCard className="h-8 w-8" />
        </div>
        <h2 className="text-text-primary mb-2 text-2xl font-bold">
          Cổng thanh toán
        </h2>
        <p className="text-text-secondary text-sm">
          Mã đơn hàng:{' '}
          <span className="text-primary font-mono font-semibold">
            {orderId}
          </span>
        </p>
      </div>

      <div className="border-border-subtle border-t"></div>

      {paymentError ? (
        <div className="border-destructive/20 bg-destructive/5 text-destructive rounded-lg border p-4 text-sm">
          {paymentError}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setSelectedPaymentMethod('web3')}
          className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 transition-colors ${
            selectedPaymentMethod === 'web3'
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-border-default hover:border-primary/50 text-text-secondary'
          }`}
        >
          <Wallet className="h-5 w-5" />
          <span className="font-semibold">Web3 bằng USDT</span>
        </button>
        <button
          onClick={() => setSelectedPaymentMethod('vnd')}
          className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 transition-colors ${
            selectedPaymentMethod === 'vnd'
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-border-default hover:border-primary/50 text-text-secondary'
          }`}
        >
          <CreditCard className="h-5 w-5" />
          <span className="font-semibold">VND qua VNPay</span>
        </button>
      </div>

      <div className="space-y-4">
        {selectedPaymentMethod === 'vnd' ? (
          <>
            <div className="bg-background-primary rounded-lg p-4">
              <h3 className="text-text-primary mb-3 text-sm font-semibold">
                Hướng dẫn thanh toán qua VNPay:
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
                    Sau khi callback/return thành công, hệ thống sẽ tiếp tục xử
                    lý đơn hàng
                  </span>
                </li>
              </ol>
            </div>

            {paymentUrl ? (
              <a
                href={paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setPaymentFlowMethod('vnd')} // Vẫn khóa execution state an toàn ở đây!
                className="block w-full"
              >
                <Button
                  variant="default"
                  className="pointer-events-none w-full py-6 text-lg font-semibold"
                >
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Mở trang thanh toán VNPay
                </Button>
              </a>
            ) : (
              <Button
                disabled={true}
                variant="default"
                className="w-full py-6 text-lg font-semibold"
              >
                <LoadingSpinner className="mr-2 h-5 w-5 border-white" />
                Đang tải trang thanh toán...
              </Button>
            )}
          </>
        ) : (
          <>
            <div className="bg-background-primary rounded-lg p-4">
              <h3 className="text-text-primary mb-3 text-sm font-semibold">
                Hướng dẫn thanh toán qua Ví Web3:
              </h3>
              <ol className="text-text-secondary space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-semibold">1.</span>
                  <span>
                    Đảm bảo bạn đã cài đặt ví MetaMask trên trình duyệt
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-semibold">2.</span>
                  <span>
                    Nhấn nút bên dưới để phê duyệt USDT và xác nhận giao dịch
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-semibold">3.</span>
                  <span>
                    Contract sẽ gọi{' '}
                    {paymentPlans.web3?.contractCall?.method || 'buyTicket'}
                  </span>
                </li>
              </ol>
            </div>

            <Button
              onClick={handleWeb3Checkout}
              disabled={
                isProcessing ||
                paymentStatus === 'expired' ||
                !paymentPlans.web3
              }
              loading={isProcessing}
              variant="primary"
              className="bg-primary-hover w-full border-0 py-6 text-lg font-semibold text-white hover:from-orange-500 hover:to-rose-600"
            >
              <Wallet className="mr-2 h-5 w-5" />
              {isProcessing
                ? statusMessage || 'Đang xử lý...'
                : 'Approve  mua vé bằng USDT'}
            </Button>
          </>
        )}

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
              <CartInfoCard event={event} showId={showId} />
            </div>
          </div>
        </div>
      </main>
      {showSyncModal && (
        <ConfirmModal
          isOpen={showSyncModal}
          title="Đồng bộ giao dịch"
          message={`Giao dịch ${syncTxHash} đã được xác nhận trên Blockchain nhưng hệ thống chưa cập nhật đơn ${orderId}. Bạn muốn thử 'Đồng bộ lại' bây giờ?`}
          onConfirm={handleResync}
          onCancel={() => setShowSyncModal(false)}
          confirmText="Đồng bộ lại"
          cancelText="Đóng"
          isLoading={isResyncing}
          iconBgColor="bg-primary/10"
          iconColor="text-primary"
        />
      )}

      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center rounded-xl bg-white p-8 shadow-2xl">
            <LoadingSpinner className="text-primary mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-bold text-gray-900">
              Đang xử lý giao dịch mua vé...
            </h3>
            <p className="animate-pulse font-medium text-blue-600">
              {statusMessage || 'Vui lòng xác nhận trên ví của bạn'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
