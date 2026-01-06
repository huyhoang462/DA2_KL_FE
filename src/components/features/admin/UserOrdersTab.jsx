import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Button from '../../ui/Button';
import LoadingSpinner from '../../ui/LoadingSpinner';
import ErrorDisplay from '../../ui/ErrorDisplay';
import TransactionDetailModal from './TransactionDetailModal';
import {
  getUserOrders,
  getTransactionById,
} from '../../../services/adminService';

const UserOrdersTab = ({ userId }) => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
  });
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['userOrders', userId, page, filters],
    queryFn: () =>
      getUserOrders(userId, {
        page,
        limit: 10,
        ...filters,
      }),
    enabled: !!userId,
  });

  const orders = data?.data?.orders || [];
  const statistics = data?.data?.statistics;
  const spendingByMonth = data?.data?.spendingByMonth || [];
  const pagination = data?.data?.pagination;

  // Fetch transaction detail
  const { data: transactionDetail } = useQuery({
    queryKey: ['transaction', selectedTransactionId],
    queryFn: () => getTransactionById(selectedTransactionId),
    enabled: !!selectedTransactionId,
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: {
        bg: 'bg-success/10',
        text: 'text-success',
        label: 'Đã thanh toán',
      },
      pending: {
        bg: 'bg-warning/10',
        text: 'text-warning',
        label: 'Chờ thanh toán',
      },
      cancelled: {
        bg: 'bg-destructive/10',
        text: 'text-destructive',
        label: 'Đã hủy',
      },
      refunded: {
        bg: 'bg-info/10',
        text: 'text-info',
        label: 'Đã hoàn tiền',
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  // Prepare chart data
  const chartData = spendingByMonth.map((item) => ({
    name: `${item.month}/${item.year}`,
    amount: item.totalSpent,
    orders: item.orderCount,
  }));

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="bg-background-primary border-border-default rounded-lg border p-4">
            <p className="text-text-secondary text-sm font-medium">Tổng số</p>
            <p className="text-text-primary mt-2 text-2xl font-bold">
              {statistics.total}
            </p>
          </div>
          <div className="bg-background-primary border-border-default rounded-lg border p-4">
            <p className="text-text-secondary text-sm font-medium">
              Đã thanh toán
            </p>
            <p className="text-success mt-2 text-2xl font-bold">
              {statistics.paid?.count || 0}
            </p>
            <p className="text-text-secondary mt-1 text-xs">
              {((statistics.paid?.amount || 0) / 1000000).toFixed(1)}M VNĐ
            </p>
          </div>
          <div className="bg-background-primary border-border-default rounded-lg border p-4">
            <p className="text-text-secondary text-sm font-medium">Đã hủy</p>
            <p className="text-destructive mt-2 text-2xl font-bold">
              {statistics.cancelled?.count || 0}
            </p>
            <p className="text-text-secondary mt-1 text-xs">
              {((statistics.cancelled?.amount || 0) / 1000000).toFixed(1)}M VNĐ
            </p>
          </div>
          <div className="bg-background-primary border-border-default rounded-lg border p-4">
            <p className="text-text-secondary text-sm font-medium">
              Đã hoàn tiền
            </p>
            <p className="text-info mt-2 text-2xl font-bold">
              {statistics.refunded?.count || 0}
            </p>
            <p className="text-text-secondary mt-1 text-xs">
              {((statistics.refunded?.amount || 0) / 1000000).toFixed(1)}M VNĐ
            </p>
          </div>
        </div>
      )}

      {/* Spending Chart */}
      {chartData.length > 0 && (
        <div className="bg-background-primary border-border-default rounded-lg border p-6">
          <h3 className="text-text-primary mb-4 text-lg font-semibold">
            Chi tiêu theo tháng
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Bar dataKey="amount" fill="#3B82F6" name="Số tiền (VNĐ)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="bg-background-primary border-border-default text-text-primary focus:border-primary rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="paid">Đã thanh toán</option>
          <option value="pending">Chờ thanh toán</option>
          <option value="cancelled">Đã hủy</option>
          <option value="refunded">Đã hoàn tiền</option>
        </select>

        <input
          type="date"
          value={filters.startDate}
          onChange={(e) =>
            setFilters({ ...filters, startDate: e.target.value })
          }
          className="bg-background-primary border-border-default text-text-primary focus:border-primary rounded-lg border px-3 py-2 text-sm"
          placeholder="Từ ngày"
        />

        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          className="bg-background-primary border-border-default text-text-primary focus:border-primary rounded-lg border px-3 py-2 text-sm"
          placeholder="Đến ngày"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-background-primary border-border-default overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-secondary border-border-default border-b">
              <tr>
                <th className="text-text-secondary px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                  Mã đơn hàng
                </th>
                <th className="text-text-secondary px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                  Sự kiện
                </th>
                <th className="text-text-secondary px-4 py-3 text-right text-xs font-medium tracking-wider uppercase">
                  Số tiền
                </th>
                <th className="text-text-secondary px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                  Phương thức
                </th>
                <th className="text-text-secondary px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                  Trạng thái
                </th>
                <th className="text-text-secondary px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                  Ngày tạo
                </th>
              </tr>
            </thead>
            <tbody className="divide-border-default divide-y">
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-text-secondary px-4 py-8 text-center"
                  >
                    Không có đơn hàng nào
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() =>
                      setSelectedTransactionId(order.transaction?.id)
                    }
                    className="hover:bg-background-secondary cursor-pointer transition-colors"
                  >
                    <td className="text-text-primary px-4 py-4 font-mono text-sm">
                      {order.orderCode}
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-text-primary text-sm font-medium">
                          {order.event?.name}
                        </p>
                        {order.event?.startDate && (
                          <p className="text-text-secondary flex items-center gap-1 text-xs">
                            <Calendar className="h-3 w-3" />
                            {new Date(order.event.startDate).toLocaleDateString(
                              'vi-VN'
                            )}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="text-text-primary px-4 py-4 text-right font-semibold">
                      {order.totalAmount?.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="text-text-primary px-4 py-4 text-sm uppercase">
                      {order?.transaction?.paymentMethod}
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="text-text-secondary px-4 py-4 text-sm">
                      {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="border-border-default flex items-center justify-between border-t px-6 py-4">
            <div className="text-text-secondary text-sm">
              Trang {pagination.currentPage} / {pagination.totalPages} - Tổng{' '}
              {pagination.totalOrders} đơn hàng
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={page === pagination.totalPages}
                variant="outline"
                size="sm"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        isOpen={!!selectedTransactionId}
        onClose={() => setSelectedTransactionId(null)}
        transaction={transactionDetail?.data}
      />
    </div>
  );
};

export default UserOrdersTab;
