// src/components/features/organizer/OrderDetailModal.jsx
import React from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Ticket,
  QrCode,
} from 'lucide-react';
import { orderStatusMap, paymentMethodMap } from '../../../utils/mockData';

const OrderDetailModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const statusInfo = orderStatusMap[order.status];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 py-6">
        <div
          className="bg-opacity-50 fixed inset-0 bg-black transition-opacity"
          onClick={onClose}
        />

        <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Chi tiết đơn hàng
              </h2>
              <p className="mt-1 text-sm text-gray-600">#{order.id}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[calc(90vh-80px)] overflow-y-auto">
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
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phương thức:</span>
                        <span className="font-medium">
                          {paymentMethodMap[order.paymentMethod]}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tổng vé:</span>
                        <span className="font-medium">
                          {order.totalTickets} vé
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
                        <span>{order.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{order.customerEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{order.customerPhone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>
                          Mua:{' '}
                          {new Date(order.purchaseDate).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="mb-2 font-medium text-gray-900">Sự kiện</h3>
                    <p className="text-sm text-gray-600">{order.eventName}</p>
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
                  {order.tickets.map((ticket, index) => (
                    <div
                      key={ticket.id}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {ticket.ticketTypeName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {ticket.quantity} vé ×{' '}
                            {ticket.unitPrice.toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {ticket.totalPrice.toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      </div>

                      {/* QR Codes */}
                      {ticket.qrCodes.length > 0 && (
                        <div>
                          <h5 className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-700">
                            <QrCode className="h-4 w-4" />
                            Mã vé QR ({ticket.qrCodes.length})
                          </h5>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                            {ticket.qrCodes.map((qrCode, qrIndex) => (
                              <div
                                key={qrIndex}
                                className="rounded border border-gray-200 bg-white p-2 text-center"
                              >
                                <div className="mx-auto mb-1 flex h-16 w-16 items-center justify-center rounded bg-gray-100">
                                  <QrCode className="h-8 w-8 text-gray-400" />
                                </div>
                                <p className="font-mono text-xs text-gray-600">
                                  {qrCode}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {ticket.qrCodes.length === 0 && (
                        <div className="py-4 text-center text-sm text-gray-500">
                          <QrCode className="mx-auto mb-2 h-8 w-8 opacity-50" />
                          Mã QR sẽ được tạo sau khi thanh toán
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="mb-4 font-medium text-gray-900">
                  Lịch sử đơn hàng
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <div className="text-sm">
                      <span className="font-medium">Đơn hàng được tạo</span>
                      <span className="ml-2 text-gray-500">
                        {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  {order.status === 'paid' && (
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <div className="text-sm">
                        <span className="font-medium">
                          Thanh toán thành công
                        </span>
                        <span className="ml-2 text-gray-500">
                          {new Date(order.updatedAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  )}

                  {order.status === 'cancelled' && order.cancelledAt && (
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-red-500"></div>
                      <div className="text-sm">
                        <span className="font-medium">Đơn hàng bị hủy</span>
                        <span className="ml-2 text-gray-500">
                          {new Date(order.cancelledAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 p-6">
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
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
