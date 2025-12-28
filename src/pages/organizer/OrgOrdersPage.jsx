// src/pages/organizer/OrgOrdersPage.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import {
  MoreVertical,
  Mail,
  XCircle,
  Eye,
  Download,
  AlertCircle,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import OrderDetailModal from '../../components/features/organizer/OrderDetailModal';
import { orderService } from '../../services/orderService';
import ErrorDisplay from '../../components/ui/ErrorDisplay';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { orderStatusMap, paymentMethodMap } from '../../utils/mockData';

const OrgOrdersPage = () => {
  const { id: eventId } = useParams();
  const queryClient = useQueryClient();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    showId: 'all',
    startDate: null,
    endDate: null,
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Fetch orders with filters
  const {
    data: ordersResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['event-orders', eventId, filters],
    queryFn: () => orderService.getEventOrders(eventId, filters),
    staleTime: 30 * 1000, // Cache 30 seconds
    enabled: !!eventId,
  });

  // Cancel order mutation
  const cancelMutation = useMutation({
    mutationFn: (orderId) => orderService.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries(['event-orders', eventId]);
      alert('Đã hủy đơn hàng thành công');
    },
    onError: (error) => {
      alert(error.message || 'Có lỗi xảy ra khi hủy đơn hàng');
    },
  });

  // Resend payment mutation
  const resendPaymentMutation = useMutation({
    mutationFn: (orderId) => orderService.resendPaymentLink(orderId),
    onSuccess: () => {
      alert('Đã gửi lại link thanh toán thành công');
    },
    onError: (error) => {
      alert(error.message || 'Có lỗi xảy ra khi gửi lại link thanh toán');
    },
  });

  const orders = ordersResponse?.orders || [];
  const pagination = ordersResponse?.pagination || {};
  const summary = ordersResponse?.summary || {};

  // ✅ Table columns configuration
  const columns = [
    {
      key: 'orderCode',
      header: 'Mã đơn hàng',
      sortable: true,
      render: (value) => (
        <span className="text-primary font-mono text-sm font-medium">
          {value}
        </span>
      ),
    },
    {
      key: 'buyer',
      header: 'Khách hàng',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">
            {value?.name || 'N/A'}
          </div>
          <div className="text-sm text-gray-500">{value?.email || 'N/A'}</div>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      sortable: true,
      render: (value) => (
        <div className="text-sm">
          <div>{new Date(value).toLocaleDateString('vi-VN')}</div>
          <div className="text-gray-500">
            {new Date(value).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      ),
    },
    {
      key: 'showName',
      header: 'Suất diễn',
      sortable: false,
      render: (value) => (
        <span className="text-sm text-gray-700">{value || 'N/A'}</span>
      ),
    },
    {
      key: 'ticketCount',
      header: 'Số vé',
      sortable: true,
      render: (value) => (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
          {value} vé
        </span>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Tổng tiền',
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-gray-900">
          {value.toLocaleString('vi-VN')}đ
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      sortable: true,
      filterable: true,
      filterPlaceholder: 'Lọc trạng thái',
      filterDisplay: (value) => orderStatusMap[value]?.label || value,
      render: (value) => {
        const statusInfo = orderStatusMap[value];
        return (
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${statusInfo?.color || 'bg-gray-100 text-gray-800'}`}
          >
            {statusInfo?.icon} {statusInfo?.label || value}
          </span>
        );
      },
    },
    {
      key: 'transactions',
      header: 'Thanh toán',
      sortable: false,
      render: (value) => {
        const latestTransaction = value?.[value.length - 1];
        const paymentMethod = latestTransaction?.paymentMethod;
        return paymentMethod
          ? paymentMethodMap[paymentMethod] || paymentMethod
          : 'Chưa';
      },
    },
  ];

  // ✅ Action buttons for each row
  const renderActions = (order) => (
    <div className="flex items-center gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleViewDetail(order);
        }}
        className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
        title="Xem chi tiết"
      >
        <Eye className="h-4 w-4" />
      </button>

      {order.status === 'paid' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleResendEmail(order);
          }}
          className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
          title="Gửi lại email"
        >
          <Mail className="h-4 w-4" />
        </button>
      )}

      {order.status === 'pending' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCancelOrder(order);
          }}
          className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
          title="Hủy đơn hàng"
        >
          <XCircle className="h-4 w-4" />
        </button>
      )}

      <div className="group relative">
        <button className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100">
          <MoreVertical className="h-4 w-4" />
        </button>
        <div className="invisible absolute right-0 z-10 mt-2 w-48 rounded-lg border border-gray-200 bg-white opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleExportOrder(order);
            }}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Xuất PDF
          </button>
        </div>
      </div>
    </div>
  );

  // ✅ Event handlers
  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleRowClick = (order) => {
    handleViewDetail(order);
  };

  const handleResendEmail = (order) => {
    if (order.status !== 'pending') {
      alert('Chỉ có thể gửi lại link thanh toán cho đơn hàng chờ thanh toán');
      return;
    }

    const isExpired = new Date(order.expiresAt) < new Date();
    if (isExpired) {
      alert('Đơn hàng đã hết hạn, không thể gửi lại link thanh toán');
      return;
    }

    if (confirm(`Gửi lại link thanh toán cho đơn hàng ${order.orderCode}?`)) {
      resendPaymentMutation.mutate(order.id);
    }
  };

  const handleCancelOrder = (order) => {
    if (order.status !== 'pending') {
      alert('Chỉ có thể hủy đơn hàng chờ thanh toán');
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn hủy đơn hàng ${order.orderCode}?`)) {
      cancelMutation.mutate(order.id);
    }
  };

  const handleExportOrder = (order) => {
    // TODO: Implement export functionality
    console.log('Exporting order:', order.orderCode);
    alert(`Đang xuất PDF cho đơn hàng ${order.orderCode}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <ErrorDisplay
        message={error?.message || 'Không thể tải danh sách đơn hàng'}
      />
    );
  }

  // ✅ Summary stats from API
  const stats = {
    total: summary.total || 0,
    paid: summary.paid || 0,
    pending: summary.pending || 0,
    cancelled: summary.cancelled || 0,
    failed: summary.failed || 0,
    totalRevenue: summary.totalRevenue || 0,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <p className="text-gray-600">
            Theo dõi và quản lý các đơn hàng của sự kiện
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-white transition-colors">
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Tổng đơn hàng</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
          <div className="text-sm text-gray-600">Đã thanh toán</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.pending}
          </div>
          <div className="text-sm text-gray-600">Chờ thanh toán</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-2xl font-bold text-red-600">
            {stats.cancelled}
          </div>
          <div className="text-sm text-gray-600">Đã hủy</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-2xl font-bold text-gray-600">{stats.failed}</div>
          <div className="text-sm text-gray-600">Thất bại</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-primary text-2xl font-bold">
            {stats.totalRevenue.toLocaleString('vi-VN')}đ
          </div>
          <div className="text-sm text-gray-600">Tổng doanh thu</div>
        </div>
      </div>

      {/* Orders Table */}
      <DataTable
        data={orders}
        columns={columns}
        actions={renderActions}
        onRowClick={handleRowClick}
        searchable={true}
        filterable={true}
        sortable={true}
        emptyMessage="Chưa có đơn hàng nào"
      />

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedOrder(null);
        }}
        orderId={selectedOrder?.id}
      />
    </div>
  );
};

export default OrgOrdersPage;
