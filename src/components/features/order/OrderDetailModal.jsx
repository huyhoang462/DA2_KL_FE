import React from 'react';
import {
  X,
  Calendar,
  MapPin,
  Ticket,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import Modal from '../../ui/Modal';
import { formatDate } from '../../../utils/formatDate';

const STATUS_CONFIG = {
  pending: {
    label: 'Chờ thanh toán',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  paid: {
    label: 'Đã thanh toán',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  failed: {
    label: 'Thanh toán thất bại',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  cancelled: {
    label: 'Đã hủy',
    icon: AlertCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
};

const PAYMENT_METHOD_LABELS = {
  vnpay: 'VNPAY',
  momo: 'MoMo',
  zalopay: 'ZaloPay',
  bank: 'Chuyển khoản ngân hàng',
};

export default function OrderDetailModal({ order, onClose }) {
  if (!order) return null;

  const statusConfig = STATUS_CONFIG[order.status];
  const StatusIcon = statusConfig?.icon || Clock;
  const firstItem = order.items?.[0];
  const event = firstItem?.ticketType?.show?.event;
  const show = firstItem?.ticketType?.show;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <Modal isOpen={true} onClose={onClose} size="xl" maxWidth="max-w-2xl">
      <div className="flex max-h-[80vh] flex-col">
        {/* Header */}
        <div className="border-border-default flex items-start justify-between border-b pb-6">
          <div className="flex-1">
            <h2 className="text-text-primary text-2xl font-bold">
              Chi tiết đơn hàng
            </h2>
            <p className="text-text-secondary mt-1 text-sm">
              Mã đơn: <span className="font-mono">{order.orderCode}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary -mt-2 -mr-2 rounded-lg p-2 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary mb-2 text-sm font-medium">
                  Trạng thái đơn hàng
                </p>
                <div
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 ${statusConfig?.bgColor}`}
                >
                  <StatusIcon className={`h-5 w-5 ${statusConfig?.color}`} />
                  <span className={`font-semibold ${statusConfig?.color}`}>
                    {statusConfig?.label}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-text-secondary text-sm">Tạo lúc</p>
                <p className="text-text-primary mt-1 font-medium">
                  {formatDate(order.createdAt, 'HH:mm DD/MM/YYYY')}
                </p>
              </div>
            </div>

            {/* Event Info */}
            {event && (
              <div className="border-border-default bg-background-secondary rounded-lg border p-4">
                <p className="text-text-secondary mb-3 text-sm font-medium">
                  Thông tin sự kiện
                </p>
                <div className="flex gap-4">
                  {event.bannerImageUrl && (
                    <img
                      src={event.bannerImageUrl}
                      alt={event.name}
                      className="h-24 w-24 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 space-y-2">
                    <h3 className="text-text-primary text-lg font-semibold">
                      {event.name}
                    </h3>
                    {event.location && (
                      <div className="text-text-secondary flex items-start gap-2 text-sm">
                        <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <span>{event.location.address}</span>
                      </div>
                    )}
                    {show && (
                      <div className="text-text-secondary flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {show.name} -{' '}
                          {formatDate(show.startTime, 'HH:mm DD/MM/YYYY')}
                        </span>
                      </div>
                    )}
                    {event.format && (
                      <div className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium">
                        {event.format === 'offline' ? 'Offline' : 'Online'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div>
              <p className="text-text-secondary mb-3 text-sm font-medium">
                Chi tiết vé
              </p>
              <div className="border-border-default overflow-hidden rounded-lg border">
                <table className="w-full">
                  <thead className="bg-background-secondary border-border-default border-b">
                    <tr>
                      <th className="text-text-secondary px-4 py-3 text-left text-xs font-medium">
                        Loại vé
                      </th>
                      <th className="text-text-secondary px-4 py-3 text-center text-xs font-medium">
                        Số lượng
                      </th>
                      <th className="text-text-secondary px-4 py-3 text-right text-xs font-medium">
                        Đơn giá
                      </th>
                      <th className="text-text-secondary px-4 py-3 text-right text-xs font-medium">
                        Thành tiền
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-border-default bg-background-primary divide-y">
                    {order.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Ticket className="text-primary h-4 w-4" />
                            <span className="text-text-primary text-sm font-medium">
                              {item.ticketType?.name || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="text-text-primary px-4 py-3 text-center text-sm">
                          {item.quantity}
                        </td>
                        <td className="text-text-primary px-4 py-3 text-right text-sm">
                          {formatCurrency(item.priceAtPurchase)}
                        </td>
                        <td className="text-text-primary px-4 py-3 text-right text-sm font-semibold">
                          {formatCurrency(item.priceAtPurchase * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="border-border-default bg-background-secondary rounded-lg border p-4">
              <p className="text-text-secondary mb-3 text-sm font-medium">
                Tổng kết thanh toán
              </p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-secondary text-sm">
                    Tổng tiền vé
                  </span>
                  <span className="text-text-primary text-sm font-medium">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
                <div className="border-border-default my-2 border-t" />
                <div className="flex justify-between">
                  <span className="text-text-primary font-semibold">
                    Tổng thanh toán
                  </span>
                  <span className="text-primary text-xl font-bold">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Transaction Info */}
            {order.transactions && order.transactions.length > 0 && (
              <div>
                <p className="text-text-secondary mb-3 text-sm font-medium">
                  Thông tin giao dịch
                </p>
                <div className="space-y-3">
                  {order.transactions.map((transaction, index) => (
                    <div
                      key={index}
                      className="border-border-default bg-background-secondary rounded-lg border p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-background-primary rounded-lg p-2">
                            <CreditCard className="text-primary h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-text-primary font-medium">
                              {PAYMENT_METHOD_LABELS[
                                transaction.paymentMethod
                              ] || transaction.paymentMethod}
                            </p>
                            {transaction.transactionCode && (
                              <p className="text-text-secondary mt-1 font-mono text-xs">
                                MGD: {transaction.transactionCode}
                              </p>
                            )}
                            {transaction.paidAt && (
                              <p className="text-text-secondary mt-1 text-xs">
                                {formatDate(
                                  transaction.createdAt,
                                  'HH:mm DD/MM/YYYY'
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-text-primary text-lg font-bold">
                            {formatCurrency(transaction.amount)}
                          </p>
                          <span
                            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                              transaction.status === 'success'
                                ? 'bg-green-50 text-green-600'
                                : transaction.status === 'pending'
                                  ? 'bg-yellow-50 text-yellow-600'
                                  : 'bg-red-50 text-red-600'
                            }`}
                          >
                            {transaction.status === 'success'
                              ? 'Thành công'
                              : transaction.status === 'pending'
                                ? 'Đang xử lý'
                                : 'Thất bại'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expiration Info for Pending Orders */}
            {order.status === 'pending' && order.expiresAt && (
              <div className="border-border-default rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-yellow-800">
                      Đơn hàng sẽ tự động hủy sau
                    </p>
                    <p className="mt-1 text-sm text-yellow-700">
                      {formatDate(order.expiresAt, 'HH:mm DD/MM/YYYY')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-border-default flex justify-end gap-3 border-t p-6">
          <button
            onClick={onClose}
            className="border-border-default text-text-primary hover:bg-background-secondary rounded-lg border px-6 py-2.5 text-sm font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
}
