import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  CreditCard,
  RefreshCw,
  Ban,
  Ticket,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { orderService } from '../../services/orderService';
import Input from '../../components/ui/Input';
import ErrorDisplay from '../../components/ui/ErrorDisplay';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import OrderDetailModal from '../../components/features/order/OrderDetailModal';
import { formatDate } from '../../utils/formatDate';

const STATUS_TABS = [
  {
    key: 'pending',
    label: 'Chờ thanh toán',
    icon: Clock,
    emptyMessage: 'Bạn không có đơn hàng nào đang chờ thanh toán',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
  },
  {
    key: 'paid',
    label: 'Đã thanh toán',
    icon: CheckCircle,
    emptyMessage: 'Bạn chưa có đơn hàng nào đã thanh toán',
    color: 'text-green-500',
    bgColor: 'bg-green-50',
  },
  {
    key: 'failed',
    label: 'Thanh toán thất bại',
    icon: XCircle,
    emptyMessage: 'Bạn không có đơn hàng nào thanh toán thất bại',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
  },
  {
    key: 'cancelled',
    label: 'Đã hủy',
    icon: Ban,
    emptyMessage: 'Bạn không có đơn hàng nào bị hủy',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
  },
];

const STATUS_CONFIG = {
  pending: {
    label: 'Chờ thanh toán',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  paid: {
    label: 'Đã thanh toán',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  failed: {
    label: 'Thất bại',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
};

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('paid');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const ITEMS_PER_PAGE = 10;

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

  const allOrders = ordersData?.orders || [];

  // Filter orders based on status and search
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

      // Filter by status
      return order.status === activeTab;
    });

    // Sort by createdAt (newest first)
    filtered.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return filtered;
  }, [activeTab, searchTerm, allOrders]);

  // Calculate status counts
  const statusCounts = useMemo(() => {
    if (!allOrders) return {};
    const counts = { pending: 0, paid: 0, failed: 0, cancelled: 0 };

    allOrders.forEach((order) => {
      if (counts.hasOwnProperty(order.status)) {
        counts[order.status]++;
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
    // Navigate to payment page or trigger payment
    navigate(`/payment/${order.id}`);
  };

  const handleCancelOrder = async (order) => {
    // TODO: Implement cancel order API call
    console.log('Cancel order:', order.id);
    refetch();
  };

  const handleRetryPayment = (order) => {
    // Navigate to payment retry
    navigate(`/payment/${order.id}`);
  };

  const handleViewTickets = (order) => {
    // Navigate to tickets page
    navigate('/my-tickets');
  };

  const currentTab = STATUS_TABS.find((tab) => tab.key === activeTab);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar & Status Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-text-placeholder absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
          <Input
            placeholder="Tìm kiếm theo mã đơn hàng, tên sự kiện..."
            inputClassName="pl-10 py-2.5"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Select */}
        <div className="relative min-w-[220px]">
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
        <div className="flex items-center justify-center py-12">
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
            <span className="font-semibold">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>
            -
            <span className="font-semibold">
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)}
            </span>{' '}
            trong tổng số{' '}
            <span className="font-semibold">{filteredOrders.length}</span> đơn
            hàng
          </p>

          {/* Table */}
          <div className="border-border-default bg-background-secondary overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background-primary border-border-default border-b">
                  <tr>
                    {/* <th className="text-text-secondary px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                      Mã đơn hàng
                    </th> */}
                    <th className="text-text-secondary px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                      Sự kiện
                    </th>
                    <th className="text-text-secondary px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                      Số lượng
                    </th>
                    <th className="text-text-secondary px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                      Tổng tiền
                    </th>
                    <th className="text-text-secondary px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                      Trạng thái
                    </th>
                    <th className="text-text-secondary px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                      Ngày tạo
                    </th>
                    <th className="text-text-secondary px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
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
                        className="hover:bg-background-primary transition-colors"
                      >
                        {/* <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-text-primary text-sm font-medium">
                            {order.orderCode}
                          </div>
                          {order.status === 'pending' && order.expiresAt && (
                            <div
                              className={`mt-1 text-xs ${
                                expired ? 'text-red-500' : 'text-text-secondary'
                              }`}
                            >
                              {expired
                                ? 'Đã hết hạn'
                                : `Hết hạn: ${formatDate(order.expiresAt, 'HH:mm DD/MM/YYYY')}`}
                            </div>
                          )}
                        </td> */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {event?.bannerImageUrl && (
                              <img
                                src={event.bannerImageUrl}
                                alt={event.name}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="text-text-primary truncate text-sm font-medium">
                                {event?.name || 'N/A'}
                              </div>
                              <div className="text-text-secondary mt-1 text-xs">
                                {firstItem?.ticketType?.show?.name || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-text-primary text-sm">
                            {order.ticketCount || 0} vé
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-text-primary text-sm font-semibold">
                            {formatCurrency(order.totalAmount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              statusConfig?.bgColor
                            } ${statusConfig?.color}`}
                          >
                            {statusConfig?.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-text-secondary text-sm">
                            {formatDate(order.createdAt, 'HH:mm DD/MM/YYYY')}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            {/* Action buttons based on status */}
                            {order.status === 'pending' && !expired && (
                              <>
                                <button
                                  onClick={() => handlePayment(order)}
                                  className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                                >
                                  <CreditCard className="h-4 w-4" />
                                  Thanh toán
                                </button>
                                <button
                                  onClick={() => handleCancelOrder(order)}
                                  className="border-border-default text-text-secondary hover:bg-background-secondary inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
                                >
                                  <Ban className="h-4 w-4" />
                                  Hủy
                                </button>
                              </>
                            )}

                            {order.status === 'paid' && (
                              <>
                                <button
                                  onClick={() => setSelectedOrder(order)}
                                  className="border-border-default text-text-secondary hover:bg-background-secondary inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
                                >
                                  <Eye className="h-4 w-4" />
                                  Chi tiết
                                </button>
                              </>
                            )}

                            {order.status === 'failed' && (
                              <>
                                <button
                                  onClick={() => handleRetryPayment(order)}
                                  className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                                >
                                  <RefreshCw className="h-4 w-4" />
                                  Đặt lại
                                </button>
                                <button
                                  onClick={() => setSelectedOrder(order)}
                                  className="border-border-default text-text-secondary hover:bg-background-secondary inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
                                >
                                  <Eye className="h-4 w-4" />
                                  Chi tiết
                                </button>
                              </>
                            )}

                            {(order.status === 'cancelled' ||
                              (order.status === 'pending' && expired)) && (
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="border-border-default text-text-secondary hover:bg-background-secondary inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
                              >
                                <Eye className="h-4 w-4" />
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
            <div className="flex items-center justify-center gap-2 pt-4">
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
                        className={`min-w-[40px] rounded-lg px-3 py-2 text-sm font-medium ${
                          currentPage === pageNum
                            ? 'bg-primary text-primary-foreground'
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
        <div className="border-border-default bg-background-secondary flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
          <div className="bg-background-primary mb-4 rounded-full p-4">
            {currentTab && (
              <currentTab.icon className="text-text-secondary h-8 w-8" />
            )}
          </div>
          <h3 className="text-text-primary mb-2 text-lg font-semibold">
            {searchTerm ? 'Không tìm thấy đơn hàng' : currentTab?.emptyMessage}
          </h3>
          <p className="text-text-secondary text-sm">
            {searchTerm
              ? 'Không có đơn hàng nào khớp với tìm kiếm của bạn.'
              : 'Hãy khám phá các sự kiện và đặt vé ngay!'}
          </p>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
