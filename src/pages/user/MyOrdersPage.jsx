import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  CreditCard,
  RefreshCw,
  Ban,
  Package,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { orderService } from '../../services/orderService';
import Input from '../../components/ui/Input';
import ErrorDisplay from '../../components/ui/ErrorDisplay';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import OrderDetailModal from '../../components/features/order/OrderDetailModal';
import { formatDate } from '../../utils/formatDate';

// "paid" tab bao gồm cả paid lẫn completed từ DB
const STATUS_TABS = [
  {
    key: 'pending',
    label: 'Chờ thanh toán',
    icon: Clock,
    emptyMessage: 'Bạn không có đơn hàng nào đang chờ thanh toán',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  {
    key: 'paid',
    label: 'Đã thanh toán',
    icon: CheckCircle,
    emptyMessage: 'Bạn chưa có đơn hàng nào đã thanh toán',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  {
    key: 'failed',
    label: 'Thanh toán thất bại',
    icon: XCircle,
    emptyMessage: 'Bạn không có đơn hàng nào thanh toán thất bại',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  {
    key: 'cancelled',
    label: 'Đã hủy',
    icon: Ban,
    emptyMessage: 'Bạn không có đơn hàng nào bị hủy',
    color: 'text-slate-500',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
  },
];

const STATUS_CONFIG = {
  pending: {
    label: 'Chờ thanh toán',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    dotColor: 'bg-amber-400',
  },
  paid: {
    label: 'Đã thanh toán',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    dotColor: 'bg-emerald-400',
  },
  // completed = paid + tickets đã được mint
  completed: {
    label: 'Đã thanh toán',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    dotColor: 'bg-emerald-500',
  },
  failed: {
    label: 'Thất bại',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    dotColor: 'bg-red-400',
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    dotColor: 'bg-slate-400',
  },
};

// Hàm map status DB sang tab key
const getTabKeyForStatus = (status) => {
  if (status === 'paid' || status === 'completed') return 'paid';
  return status; // pending, failed, cancelled
};

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('paid');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const orderIdFromUrl = searchParams.get('orderId');

  // Fetch orders data
  const {
    data: ordersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['myOrders'],
    queryFn: orderService.getMyOrders,
    staleTime: 1000 * 60 * 2,
  });

  const allOrders = useMemo(() => ordersData?.orders || [], [ordersData]);

  const openOrderModal = (order) => {
    if (!order?.id) return;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('orderId', order.id);
    setSearchParams(nextParams);
  };

  const closeOrderModal = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('orderId');
    setSearchParams(nextParams, { replace: true });
  };

  const selectedOrder = useMemo(() => {
    if (!orderIdFromUrl) return null;
    return (
      allOrders.find((order) => String(order?.id) === String(orderIdFromUrl)) ||
      null
    );
  }, [allOrders, orderIdFromUrl]);

  React.useEffect(() => {
    if (!orderIdFromUrl) return;
    if (isLoading || isError) return;

    if (selectedOrder) return;

    // Order id not found -> clean the param to avoid a dead link.
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('orderId');
    setSearchParams(nextParams, { replace: true });
  }, [
    orderIdFromUrl,
    allOrders,
    isLoading,
    isError,
    searchParams,
    setSearchParams,
    selectedOrder,
  ]);

  // Filter orders: tab "paid" bao gồm cả paid lẫn completed
  const filteredOrders = useMemo(() => {
    if (!allOrders) return [];

    let filtered = allOrders.filter((order) => {
      // Filter by search term
      const matchesSearch =
        searchTerm === '' ||
        order.orderCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items?.[0]?.ticketType?.show?.event?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Filter by status - paid tab bao gồm cả "paid" và "completed"
      return getTabKeyForStatus(order.status) === activeTab;
    });

    // Sort by createdAt (newest first)
    filtered.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return filtered;
  }, [activeTab, searchTerm, allOrders]);

  // Calculate status counts - gộp paid + completed vào tab "paid"
  const statusCounts = useMemo(() => {
    if (!allOrders) return {};
    const counts = { pending: 0, paid: 0, failed: 0, cancelled: 0 };

    allOrders.forEach((order) => {
      const tabKey = getTabKeyForStatus(order.status);
      if (Object.prototype.hasOwnProperty.call(counts, tabKey)) {
        counts[tabKey]++;
      }
    });

    return counts;
  }, [allOrders]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage]);

  // Reset to page 1 when tab or search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  // Check if order is expired
  const isOrderExpired = (order) => {
    if (order.status !== 'pending') return false;
    return new Date(order.expiresAt) < new Date();
  };

  // Handle actions
  const handlePayment = (order) => {
    navigate(`/payment/${order.id}`);
  };

  const handleCancelOrder = async (order) => {
    console.log('Cancel order:', order.id);
    refetch();
  };

  const handleRetryPayment = (order) => {
    navigate(`/payment/${order.id}`);
  };

  const currentTab = STATUS_TABS.find((tab) => tab.key === activeTab);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-text-primary text-xl font-bold tracking-tight">
          Lịch sử đơn hàng
        </h2>
        <p className="text-text-secondary text-sm">
          Quản lý và theo dõi tất cả đơn hàng của bạn
        </p>
      </div>

      {/* Search Bar & Status Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-text-placeholder absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Tìm kiếm theo mã đơn hàng, tên sự kiện..."
            inputClassName="pl-9 py-2.5 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Select */}
        <div className="relative min-w-[200px]">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="border-border-default bg-background-secondary text-text-primary focus:border-primary focus:ring-primary/20 w-full cursor-pointer appearance-none rounded-lg border px-4 py-2.5 pr-10 text-sm font-medium transition-colors focus:ring-2 focus:outline-none"
          >
            {STATUS_TABS.map((tab) => {
              const count = statusCounts[tab.key] || 0;
              return (
                <option key={tab.key} value={tab.key}>
                  {tab.label} {count > 0 ? `(${count})` : ''}
                </option>
              );
            })}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
            <svg
              className="text-text-secondary h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : isError ? (
        <ErrorDisplay
          message={error?.message || 'Không thể tải danh sách đơn hàng.'}
        />
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-4">
          <p className="text-text-secondary text-sm">
            Hiển thị{' '}
            <span className="text-text-primary font-semibold">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>
            –
            <span className="text-text-primary font-semibold">
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)}
            </span>{' '}
            trong tổng số{' '}
            <span className="text-text-primary font-semibold">
              {filteredOrders.length}
            </span>{' '}
            đơn hàng
          </p>

          {/* Table */}
          <div className="border-border-default bg-background-secondary overflow-hidden rounded-xl border shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background-primary border-border-default border-b">
                  <tr>
                    <th className="text-text-secondary px-5 py-3.5 text-left text-xs font-semibold tracking-wider uppercase">
                      Sự kiện
                    </th>
                    <th className="text-text-secondary px-5 py-3.5 text-left text-xs font-semibold tracking-wider uppercase">
                      Số lượng
                    </th>
                    <th className="text-text-secondary px-5 py-3.5 text-left text-xs font-semibold tracking-wider uppercase">
                      Tổng tiền
                    </th>
                    <th className="text-text-secondary px-5 py-3.5 text-left text-xs font-semibold tracking-wider uppercase">
                      Trạng thái
                    </th>
                    <th className="text-text-secondary px-5 py-3.5 text-left text-xs font-semibold tracking-wider uppercase">
                      Ngày tạo
                    </th>
                    <th className="text-text-secondary px-5 py-3.5 text-right text-xs font-semibold tracking-wider uppercase">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border-default divide-y">
                  {paginatedOrders.map((order) => {
                    const firstItem = order.items?.[0];
                    const event = firstItem?.ticketType?.show?.event;
                    const statusConfig = STATUS_CONFIG[order.status];
                    const expired = isOrderExpired(order);

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-background-primary/60 transition-colors duration-150"
                      >
                        {/* Event */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {event?.bannerImageUrl ? (
                              <img
                                src={event.bannerImageUrl}
                                alt={event.name}
                                className="h-11 w-11 flex-shrink-0 rounded-lg object-cover shadow-sm"
                              />
                            ) : (
                              <div className="bg-background-primary border-border-default flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border">
                                <Package className="text-text-tertiary h-5 w-5" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="text-text-primary truncate text-sm font-semibold">
                                {event?.name || 'N/A'}
                              </div>
                              <div className="text-text-secondary mt-0.5 text-xs">
                                {firstItem?.ticketType?.show?.name || ''}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Ticket count */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="text-text-primary text-sm font-medium">
                            {order.ticketCount === 0
                              ? order?.items?.length
                              : order.ticketCount}{' '}
                            vé
                          </span>
                        </td>

                        {/* Total */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="text-text-primary text-sm font-bold">
                            {order.totalAmount}{' '}
                            <span className="text-text-secondary font-normal">
                              USDT
                            </span>
                          </span>
                        </td>

                        {/* Status badge */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusConfig?.bgColor} ${statusConfig?.color}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${statusConfig?.dotColor}`}
                            />
                            {statusConfig?.label}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="text-text-secondary text-sm">
                            {formatDate(order.createdAt, 'HH:mm DD/MM/YYYY')}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            {order.status === 'pending' && !expired && (
                              <>
                                <button
                                  onClick={() => handlePayment(order)}
                                  className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition-all hover:shadow"
                                >
                                  <CreditCard className="h-3.5 w-3.5" />
                                  Thanh toán
                                </button>
                                <button
                                  onClick={() => handleCancelOrder(order)}
                                  className="border-border-default text-text-secondary hover:bg-background-primary inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors"
                                >
                                  <Ban className="h-3.5 w-3.5" />
                                  Hủy
                                </button>
                              </>
                            )}

                            {(order.status === 'paid' ||
                              order.status === 'completed') && (
                              <button
                                onClick={() => openOrderModal(order)}
                                className="border-border-default text-text-secondary hover:bg-background-primary hover:text-text-primary inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                Chi tiết
                              </button>
                            )}

                            {order.status === 'failed' && (
                              <>
                                <button
                                  onClick={() => handleRetryPayment(order)}
                                  className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition-all hover:shadow"
                                >
                                  <RefreshCw className="h-3.5 w-3.5" />
                                  Đặt lại
                                </button>
                                <button
                                  onClick={() => openOrderModal(order)}
                                  className="border-border-default text-text-secondary hover:bg-background-primary inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  Chi tiết
                                </button>
                              </>
                            )}

                            {(order.status === 'cancelled' ||
                              (order.status === 'pending' && expired)) && (
                              <button
                                onClick={() => openOrderModal(order)}
                                className="border-border-default text-text-secondary hover:bg-background-primary inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                Xem chi tiết
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="border-border-default text-text-primary hover:bg-background-secondary disabled:text-text-tertiary rounded-lg border px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
              >
                Trước
              </button>

              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`min-w-[36px] rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'border-border-default text-text-primary hover:bg-background-secondary border'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return (
                      <span
                        key={pageNum}
                        className="text-text-tertiary px-2 py-2 text-sm"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="border-border-default text-text-primary hover:bg-background-secondary disabled:text-text-tertiary rounded-lg border px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="border-border-default bg-background-secondary flex flex-col items-center justify-center rounded-xl border border-dashed p-16 text-center">
          <div
            className={`mb-4 rounded-full p-4 ${currentTab?.bgColor || 'bg-background-primary'}`}
          >
            {currentTab && (
              <currentTab.icon
                className={`h-8 w-8 ${currentTab.color || 'text-text-secondary'}`}
              />
            )}
          </div>
          <h3 className="text-text-primary mb-2 text-lg font-semibold">
            {searchTerm ? 'Không tìm thấy đơn hàng' : currentTab?.emptyMessage}
          </h3>
          <p className="text-text-secondary max-w-xs text-sm">
            {searchTerm
              ? 'Không có đơn hàng nào khớp với tìm kiếm của bạn.'
              : 'Hãy khám phá các sự kiện và đặt vé ngay!'}
          </p>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={closeOrderModal} />
      )}
    </div>
  );
}
