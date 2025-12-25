import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  DollarSign,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import ErrorDisplay from '../../components/ui/ErrorDisplay';
import TransactionsTableSkeleton from '../../components/ui/TransactionsTableSkeleton';
import TransactionDetailModal from '../../components/features/admin/TransactionDetailModal';
import RefundTransactionModal from '../../components/features/admin/RefundTransactionModal';
import {
  getTransactions,
  getTransactionById,
  refundTransaction,
} from '../../services/adminService';

const AdminTransactionsPage = () => {
  const queryClient = useQueryClient();

  // Filters state
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    status: '',
    paymentMethod: '',
    searchTerm: '',
    startDate: '',
    endDate: '',
  });

  const [tempFilters, setTempFilters] = useState(filters);

  // Modal states
  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    transactionId: null,
  });

  const [refundModalState, setRefundModalState] = useState({
    isOpen: false,
    transaction: null,
  });

  // Fetch transactions
  const { data, isLoading, error } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => getTransactions(filters),
  });

  // Fetch transaction detail
  const { data: transactionDetail } = useQuery({
    queryKey: ['transaction', detailModalState.transactionId],
    queryFn: () => getTransactionById(detailModalState.transactionId),
    enabled: !!detailModalState.transactionId,
  });

  // Refund mutation
  const refundMutation = useMutation({
    mutationFn: ({ transactionId, reason }) =>
      refundTransaction(transactionId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions']);
      queryClient.invalidateQueries([
        'transaction',
        refundModalState.transaction?._id,
      ]);
      setRefundModalState({ isOpen: false, transaction: null });
    },
  });

  const transactions = data?.data?.transactions || [];
  const pagination = data?.data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  };

  const handleApplyFilters = () => {
    setFilters({ ...tempFilters, page: 1 });
  };

  const handleResetFilters = () => {
    const resetFilters = {
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      status: '',
      paymentMethod: '',
      searchTerm: '',
      startDate: '',
      endDate: '',
    };
    setTempFilters(resetFilters);
    setFilters(resetFilters);
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleViewDetail = (transactionId) => {
    setDetailModalState({ isOpen: true, transactionId });
  };

  const handleOpenRefund = (transaction) => {
    setRefundModalState({ isOpen: true, transaction });
  };

  const handleConfirmRefund = (reason) => {
    refundMutation.mutate({
      transactionId: refundModalState.transaction._id,
      reason,
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      success: {
        bg: 'bg-success/10',
        text: 'text-success',
        label: 'Thành công',
      },
      pending: {
        bg: 'bg-warning/10',
        text: 'text-warning',
        label: 'Đang xử lý',
      },
      failed: {
        bg: 'bg-destructive/10',
        text: 'text-destructive',
        label: 'Thất bại',
      },
      refunded: { bg: 'bg-info/10', text: 'text-info', label: 'Đã hoàn tiền' },
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

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Check if filters have changed
  const hasFilterChanges = () => {
    return (
      tempFilters.searchTerm !== filters.searchTerm ||
      tempFilters.status !== filters.status ||
      tempFilters.paymentMethod !== filters.paymentMethod ||
      tempFilters.startDate !== filters.startDate ||
      tempFilters.endDate !== filters.endDate
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-text-primary text-2xl font-bold">
            Quản lý giao dịch
          </h1>
          <p className="text-text-secondary mt-1 text-sm">
            Quản lý và theo dõi các giao dịch thanh toán
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-background-primary border-border-default rounded-lg">
        <div className="mb-4 flex gap-3">
          <div className="md:flex-1">
            <label className="text-text-secondary mb-1 block text-sm font-medium">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="text-text-secondary absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                value={tempFilters.searchTerm}
                onChange={(e) =>
                  setTempFilters((prev) => ({
                    ...prev,
                    searchTerm: e.target.value,
                  }))
                }
                placeholder="Mã giao dịch, mã đơn, email, tên người dùng..."
                className="bg-background-secondary border-border-default text-text-primary placeholder:text-text-secondary focus:border-primary w-full rounded-lg border py-2 pr-4 pl-10 text-sm focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <Button
              onClick={handleApplyFilters}
              variant="primary"
              disabled={!hasFilterChanges()}
            >
              Áp dụng
            </Button>
            <Button onClick={handleResetFilters} variant="outline">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="text-text-secondary mb-1 block text-sm font-medium">
              Trạng thái
            </label>
            <select
              value={tempFilters.status}
              onChange={(e) =>
                setTempFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className="bg-background-secondary border-border-default text-text-primary focus:border-primary w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">Tất cả</option>
              <option value="success">Thành công</option>
              <option value="pending">Đang xử lý</option>
              <option value="failed">Thất bại</option>
              <option value="refunded">Đã hoàn tiền</option>
            </select>
          </div>

          <div>
            <label className="text-text-secondary mb-1 block text-sm font-medium">
              Phương thức thanh toán
            </label>
            <select
              value={tempFilters.paymentMethod}
              onChange={(e) =>
                setTempFilters((prev) => ({
                  ...prev,
                  paymentMethod: e.target.value,
                }))
              }
              className="bg-background-secondary border-border-default text-text-primary focus:border-primary w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">Tất cả</option>
              <option value="vnpay">VNPay</option>
              <option value="momo">Momo</option>
              <option value="crypto">Crypto</option>
            </select>
          </div>

          <div>
            <label className="text-text-secondary mb-1 block text-sm font-medium">
              Từ ngày
            </label>
            <input
              type="date"
              value={tempFilters.startDate}
              onChange={(e) =>
                setTempFilters((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
              className="bg-background-secondary border-border-default text-text-primary focus:border-primary w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
            />
          </div>
          <div className="">
            <label className="text-text-secondary mb-1 block text-sm font-medium">
              Đến ngày
            </label>
            <input
              type="date"
              value={tempFilters.endDate}
              onChange={(e) =>
                setTempFilters((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="bg-background-secondary border-border-default text-text-primary focus:border-primary w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-background-secondary border-border-default overflow-hidden rounded-lg border">
        {isLoading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              {/* Table Header Skeleton */}
              <div className="border-border-default grid grid-cols-8 gap-4 border-b pb-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-background-primary h-4 rounded"
                  ></div>
                ))}
              </div>
              {/* Table Rows Skeleton */}
              {Array.from({ length: 10 }).map((_, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-8 gap-4">
                  {Array.from({ length: 8 }).map((_, colIndex) => (
                    <div
                      key={colIndex}
                      className="bg-background-primary h-8 rounded"
                    ></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="p-8">
            <ErrorDisplay error={error} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background-primary border-border-default border-b">
                  <tr>
                    <th className="text-text-secondary px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                      Mã giao dịch
                    </th>
                    <th className="text-text-secondary px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                      Mã đơn hàng
                    </th>
                    <th className="text-text-secondary px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                      Người mua
                    </th>
                    <th className="text-text-secondary px-4 py-3 text-right text-xs font-medium tracking-wider uppercase">
                      Số tiền
                    </th>
                    <th className="text-text-secondary px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                      PT thanh toán
                    </th>
                    <th className="text-text-secondary px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                      Trạng thái
                    </th>
                    <th className="text-text-secondary px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                      Ngày tạo
                    </th>
                    <th className="text-text-secondary px-4 py-3 text-right text-xs font-medium tracking-wider uppercase">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border-default divide-y">
                  {transactions.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="text-text-secondary px-4 py-8 text-center"
                      >
                        Không tìm thấy giao dịch nào
                      </td>
                    </tr>
                  ) : (
                    transactions.map((transaction) => (
                      <tr
                        key={transaction._id}
                        className="hover:bg-background-primary"
                      >
                        <td className="text-text-primary px-4 py-4 font-mono text-sm">
                          {transaction.transactionCode}
                        </td>
                        <td className="text-text-primary px-4 py-4 font-mono text-sm">
                          {transaction.order?.orderCode}
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-text-primary text-sm font-medium">
                              {transaction.buyer?.fullName}
                            </p>
                            <p className="text-text-secondary text-xs">
                              {transaction.buyer?.email}
                            </p>
                          </div>
                        </td>
                        <td className="text-text-primary px-4 py-4 text-right text-sm font-semibold">
                          {transaction.amount?.toLocaleString('vi-VN')} ₫
                        </td>
                        <td className="text-text-primary px-4 py-4 text-sm uppercase">
                          {transaction.paymentMethod}
                        </td>
                        <td className="px-4 py-4">
                          {getStatusBadge(transaction.status)}
                        </td>
                        <td className="text-text-secondary px-4 py-4 text-sm">
                          {formatDate(transaction.createdAt)}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewDetail(transaction._id)}
                              className="text-primary hover:text-primary-dark"
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {transaction.status === 'success' && (
                              <button
                                onClick={() => handleOpenRefund(transaction)}
                                className="text-warning hover:text-warning-dark"
                                title="Hoàn tiền"
                              >
                                <DollarSign className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {transactions.length > 0 && (
              <div className="border-border-default flex items-center justify-between border-t px-6 py-4">
                <div className="text-text-secondary text-sm">
                  Hiển thị{' '}
                  {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} -{' '}
                  {Math.min(
                    pagination.currentPage * pagination.itemsPerPage,
                    pagination.totalItems
                  )}{' '}
                  trong tổng số {pagination.totalItems} giao dịch
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex gap-1">
                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1
                    )
                      .filter((page) => {
                        const current = pagination.currentPage;
                        return (
                          page === 1 ||
                          page === pagination.totalPages ||
                          (page >= current - 1 && page <= current + 1)
                        );
                      })
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="text-text-secondary px-2">
                              ...
                            </span>
                          )}
                          <Button
                            onClick={() => handlePageChange(page)}
                            variant={
                              page === pagination.currentPage
                                ? 'primary'
                                : 'outline'
                            }
                            size="sm"
                            className="min-w-[40px]"
                          >
                            {page}
                          </Button>
                        </React.Fragment>
                      ))}
                  </div>
                  <Button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <TransactionDetailModal
        isOpen={detailModalState.isOpen}
        onClose={() =>
          setDetailModalState({ isOpen: false, transactionId: null })
        }
        transaction={transactionDetail?.data}
      />

      <RefundTransactionModal
        isOpen={refundModalState.isOpen}
        onClose={() =>
          setRefundModalState({ isOpen: false, transaction: null })
        }
        transaction={refundModalState.transaction}
        onConfirm={handleConfirmRefund}
        isLoading={refundMutation.isPending}
      />
    </div>
  );
};

export default AdminTransactionsPage;
