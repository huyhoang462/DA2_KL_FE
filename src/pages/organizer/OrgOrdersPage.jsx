// src/pages/organizer/OrgOrdersPage.jsx
import React, { useState } from 'react';
import { MoreVertical, Mail, XCircle, Eye, Download } from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import OrderDetailModal from '../../components/features/organizer/OrderDetailModal';
import {
  mockOrdersData,
  orderStatusMap,
  paymentMethodMap,
} from '../../utils/mockData';

const OrgOrdersPage = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // ✅ Table columns configuration
  const columns = [
    {
      key: 'id',
      header: 'Mã đơn hàng',
      sortable: true,
      render: (value) => (
        <span className="text-primary font-mono text-sm font-medium">
          {value}
        </span>
      ),
    },
    {
      key: 'customerName',
      header: 'Khách hàng',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.customerEmail}</div>
        </div>
      ),
    },
    {
      key: 'purchaseDate',
      header: 'Ngày mua',
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
      key: 'totalTickets',
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
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${statusInfo.color}`}
          >
            {statusInfo.icon} {statusInfo.label}
          </span>
        );
      },
    },
    {
      key: 'paymentMethod',
      header: 'Thanh toán',
      sortable: false,
      filterable: true,
      filterPlaceholder: 'Lọc phương thức',
      filterDisplay: (value) => paymentMethodMap[value] || value,
      render: (value) => paymentMethodMap[value] || value,
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
    // TODO: Implement resend email functionality
    console.log('Resending email for order:', order.id);
    alert(`Đã gửi lại email xác nhận cho đơn hàng ${order.id}`);
  };

  const handleCancelOrder = (order) => {
    // TODO: Implement cancel order functionality
    if (confirm(`Bạn có chắc chắn muốn hủy đơn hàng ${order.id}?`)) {
      console.log('Cancelling order:', order.id);
      alert(`Đã hủy đơn hàng ${order.id}`);
    }
  };

  const handleExportOrder = (order) => {
    // TODO: Implement export functionality
    console.log('Exporting order:', order.id);
    alert(`Đang xuất PDF cho đơn hàng ${order.id}`);
  };

  // ✅ Summary stats
  const stats = {
    total: mockOrdersData.length,
    paid: mockOrdersData.filter((o) => o.status === 'paid').length,
    pending: mockOrdersData.filter((o) => o.status === 'pending').length,
    cancelled: mockOrdersData.filter((o) => o.status === 'cancelled').length,
    totalRevenue: mockOrdersData
      .filter((o) => o.status === 'paid')
      .reduce((sum, o) => sum + o.totalAmount, 0),
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
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
          <div className="text-primary text-2xl font-bold">
            {stats.totalRevenue.toLocaleString('vi-VN')}đ
          </div>
          <div className="text-sm text-gray-600">Tổng doanh thu</div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <DataTable
          data={mockOrdersData}
          columns={columns}
          actions={renderActions}
          onRowClick={handleRowClick}
          searchable={true}
          filterable={true}
          sortable={true}
          emptyMessage="Chưa có đơn hàng nào"
        />
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
      />
    </div>
  );
};

export default OrgOrdersPage;
