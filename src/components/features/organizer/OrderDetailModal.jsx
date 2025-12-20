// src/components/features/organizer/OrderDetailModal.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Ticket,
  QrCode,
} from 'lucide-react';
import { orderStatusMap, paymentMethodMap } from '../../../utils/mockData';
import { orderService } from '../../../services/orderService';
import LoadingSpinner from '../../ui/LoadingSpinner';
import ErrorDisplay from '../../ui/ErrorDisplay';
import Modal from '../../ui/Modal';

const OrderDetailModal = ({ isOpen, onClose, orderId }) => {
  // Fetch order details từ API
  const {
    data: orderData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['order-details', orderId],
    queryFn: () => orderService.getOrderDetails(orderId),
    enabled: isOpen && !!orderId,
    staleTime: 60 * 1000, // Cache 1 minute
  });

  const order = orderData?.order;

  // Loading state
  if (isLoading) {
    return (
      <Modal
        isOpen={isOpen}
        title="Chi tiết đơn hàng"
        onClose={onClose}
        xButton={true}
        maxWidth="max-w-4xl"
      >
        <div className="flex h-96 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Modal>
    );
  }

  // Error state
  if (isError || !order) {
    return (
      <Modal
        isOpen={isOpen}
        title="Chi tiết đơn hàng"
        onClose={onClose}
        xButton={true}
        maxWidth="max-w-4xl"
      >
        <ErrorDisplay
          message={error?.message || 'Không thể tải chi tiết đơn hàng'}
        />
        <button
          onClick={onClose}
          className="mt-4 rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
        >
          Đóng
        </button>
      </Modal>
    );
  }

  const statusInfo = orderStatusMap[order.status];

  return (
    <Modal
      isOpen={isOpen}
      title={
        <div>
          <div className="text-xl font-semibold">Chi tiết đơn hàng</div>
          <p className="mt-1 text-sm text-gray-600">#{order.orderCode}</p>
        </div>
      }
      onClose={onClose}
      xButton={true}
      maxWidth="max-w-4xl"
    >
      <div className="max-h-[70vh] overflow-y-auto">
        <div className="space-y-6 p-6">
          {/* Status & Summary */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="mb-3 font-medium text-gray-900">
                  Trạng thái đơn hàng
                </h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${statusInfo.color}`}
                  >
                    {statusInfo.icon} {statusInfo.label}
                  </span>
                </div>
                {order.status === 'cancelled' && order.cancelReason && (
                  <p className="mt-2 text-sm text-gray-600">
                    Lý do: {order.cancelReason}
                  </p>
                )}
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="mb-3 font-medium text-gray-900">
                  Thông tin thanh toán
                </h3>
                <div className="space-y-2 text-sm">
                  {order.transactions?.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phương thức:</span>
                      <span className="font-medium">
                        {paymentMethodMap[
                          order.transactions[order.transactions.length - 1]
                            ?.paymentMethod
                        ] ||
                          order.transactions[order.transactions.length - 1]
                            ?.paymentMethod ||
                          'N/A'}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng vé:</span>
                    <span className="font-medium">
                      {order.items?.reduce(
                        (sum, item) => sum + (item.quantity || 0),
                        0
                      ) || 0}{' '}
                      vé
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-semibold">
                    <span>Tổng tiền:</span>
                    <span className="text-primary">
                      {order.totalAmount.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="mb-3 flex items-center gap-2 font-medium text-gray-900">
                  <User className="h-4 w-4" />
                  Thông tin khách hàng
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>{order.buyer?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{order.buyer?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{order.buyer?.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>
                      Tạo: {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  {order.expiresAt && order.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-red-400" />
                      <span className="text-red-600">
                        Hết hạn:{' '}
                        {new Date(order.expiresAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="mb-2 font-medium text-gray-900">Sự kiện</h3>
                <div className="space-y-1 text-sm">
                  {order.items?.[0] ? (
                    <>
                      <p className="font-medium text-gray-900">
                        {order.items[0].eventName}
                      </p>
                      <p className="text-gray-600">
                        Suất diễn: {order.items[0].showName}
                      </p>
                      {order.items[0].showStartTime && (
                        <p className="text-gray-600">
                          Thời gian:{' '}
                          {new Date(
                            order.items[0].showStartTime
                          ).toLocaleString('vi-VN')}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500">Chưa có thông tin</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tickets Detail */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 font-medium text-gray-900">
              <Ticket className="h-5 w-5" />
              Chi tiết vé đã mua
            </h3>
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {item.ticketTypeName || 'N/A'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {item.quantity || 0} vé ×{' '}
                        {(item.priceAtPurchase || 0).toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {(item.subtotal || 0).toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QR Codes */}
          {order.tickets && order.tickets.length > 0 && (
            <div>
              <h3 className="mb-4 flex items-center gap-2 font-medium text-gray-900">
                <Ticket className="h-5 w-5" />
                Mã QR vé
              </h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {order.tickets.map((ticket, index) => (
                  <div
                    key={ticket.id || index}
                    className="rounded-lg border border-gray-200 p-4 text-center"
                  >
                    <div className="mb-2 flex justify-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100">
                        <Ticket className="h-10 w-10 text-gray-400" />
                      </div>
                    </div>
                    <p className="mb-1 text-xs font-medium text-gray-900">
                      {ticket.ticketTypeName}
                    </p>
                    <p className="mb-1 font-mono text-xs text-gray-600">
                      {ticket.qrCode}
                    </p>
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        ticket.status === 'used'
                          ? 'bg-green-100 text-green-700'
                          : ticket.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {ticket.status === 'used'
                        ? 'Đã dùng'
                        : ticket.status === 'pending'
                          ? 'Chưa dùng'
                          : ticket.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline / Transactions */}
          <div>
            <h3 className="mb-4 font-medium text-gray-900">
              Lịch sử giao dịch
            </h3>
            <div className="space-y-3">
              {order.transactions?.length > 0 ? (
                order.transactions.map((transaction, index) => (
                  <div
                    key={transaction._id || index}
                    className="flex items-center gap-3"
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${
                        transaction.status === 'success'
                          ? 'bg-green-500'
                          : transaction.status === 'pending'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                    ></div>
                    <div className="flex-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {transaction.status === 'success'
                            ? 'Thanh toán thành công'
                            : transaction.status === 'pending'
                              ? 'Chờ thanh toán'
                              : 'Thanh toán thất bại'}
                        </span>
                        <span className="text-gray-500">
                          {new Date(transaction.createdAt).toLocaleString(
                            'vi-VN'
                          )}
                        </span>
                      </div>
                      {transaction.paymentMethod && (
                        <span className="text-gray-600">
                          {paymentMethodMap[transaction.paymentMethod] ||
                            transaction.paymentMethod}
                        </span>
                      )}
                      {transaction.transactionCode && (
                        <span className="ml-2 text-xs text-gray-500">
                          ID: {transaction.transactionCode}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <div className="text-sm">
                    <span className="font-medium">Đơn hàng được tạo</span>
                    <span className="ml-2 text-gray-500">
                      {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
              )}

              {order.cancelledAt && (
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  <div className="text-sm">
                    <span className="font-medium">Đơn hàng bị hủy</span>
                    <span className="ml-2 text-gray-500">
                      {new Date(order.cancelledAt).toLocaleString('vi-VN')}
                    </span>
                    {order.cancelReason && (
                      <p className="mt-1 text-gray-600">
                        Lý do: {order.cancelReason}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4">
        <button
          onClick={onClose}
          className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
        >
          Đóng
        </button>
        {order.status === 'paid' && (
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
            Gửi lại email xác nhận
          </button>
        )}
        {order.status === 'pending' && (
          <button className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700">
            Hủy đơn hàng
          </button>
        )}
      </div>
    </Modal>
  );
};

export default OrderDetailModal;
