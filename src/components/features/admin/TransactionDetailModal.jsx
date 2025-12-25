import React from 'react';
import Modal from '../../ui/Modal';
import { X, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const TransactionDetailModal = ({ isOpen, onClose, transaction }) => {
  const [copiedField, setCopiedField] = useState(null);

  if (!transaction) return null;

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const statusColors = {
    success: 'bg-success/10 text-success',
    pending: 'bg-warning/10 text-warning',
    failed: 'bg-destructive/10 text-destructive',
    refunded: 'bg-info/10 text-info',
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

  return (
    <Modal
      isOpen={isOpen}
      xButton={true}
      title="Chi tiết giao dịch"
      onClose={onClose}
      size="xl"
      maxWidth="max-w-2xl "
    >
      <div className="max-h-[80vh] space-y-6 overflow-y-auto">
        {/* Transaction Info */}
        <div className="bg-background-primary border-border-default rounded-lg border p-4">
          <h3 className="text-text-primary mb-4 text-lg font-semibold">
            Thông tin giao dịch
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-text-secondary mb-1 text-sm">Mã giao dịch</p>
              <div className="flex items-center gap-2">
                <p className="text-text-primary font-mono text-sm">
                  {transaction.transactionCode}
                </p>
                <button
                  onClick={() =>
                    handleCopy(transaction.transactionCode, 'txCode')
                  }
                  className="text-text-secondary hover:text-primary"
                >
                  {copiedField === 'txCode' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <p className="text-text-secondary mb-1 text-sm">Mã đơn hàng</p>
              <div className="flex items-center gap-2">
                <p className="text-text-primary font-mono text-sm">
                  {transaction.order?.orderCode}
                </p>
                <button
                  onClick={() =>
                    handleCopy(transaction.order?.orderCode, 'orderCode')
                  }
                  className="text-text-secondary hover:text-primary"
                >
                  {copiedField === 'orderCode' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <p className="text-text-secondary mb-1 text-sm">Số tiền</p>
              <p className="text-text-primary text-lg font-semibold">
                {transaction.amount?.toLocaleString('vi-VN')} ₫
              </p>
            </div>
            <div>
              <p className="text-text-secondary mb-1 text-sm">
                Phương thức thanh toán
              </p>
              <p className="text-text-primary font-medium uppercase">
                {transaction.paymentMethod}
              </p>
            </div>
            <div>
              <p className="text-text-secondary mb-1 text-sm">Trạng thái</p>
              <span
                className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                  statusColors[transaction.status]
                }`}
              >
                {transaction.status === 'success' && 'Thành công'}
                {transaction.status === 'pending' && 'Đang xử lý'}
                {transaction.status === 'failed' && 'Thất bại'}
                {transaction.status === 'refunded' && 'Đã hoàn tiền'}
              </span>
            </div>
            <div>
              <p className="text-text-secondary mb-1 text-sm">Ngày tạo</p>
              <p className="text-text-primary text-sm">
                {formatDate(transaction.createdAt)}
              </p>
            </div>
          </div>

          {transaction.status === 'refunded' && (
            <div className="border-border-default mt-4 border-t pt-4">
              <h4 className="text-text-primary mb-2 font-semibold">
                Thông tin hoàn tiền
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-text-secondary mb-1 text-sm">
                    Số tiền hoàn
                  </p>
                  <p className="text-text-primary font-semibold">
                    {transaction.refundAmount?.toLocaleString('vi-VN')} ₫
                  </p>
                </div>
                <div>
                  <p className="text-text-secondary mb-1 text-sm">
                    Ngày hoàn tiền
                  </p>
                  <p className="text-text-primary text-sm">
                    {formatDate(transaction.refundedAt)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-text-secondary mb-1 text-sm">Lý do</p>
                  <p className="text-text-primary text-sm">
                    {transaction.refundReason}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Buyer Info */}
        <div className="bg-background-primary border-border-default rounded-lg border p-4">
          <h3 className="text-text-primary mb-4 text-lg font-semibold">
            Thông tin người mua
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-text-secondary mb-1 text-sm">Họ tên</p>
              <p className="text-text-primary font-medium">
                {transaction.buyer?.fullName}
              </p>
            </div>
            <div>
              <p className="text-text-secondary mb-1 text-sm">Email</p>
              <p className="text-text-primary">{transaction.buyer?.email}</p>
            </div>
            <div>
              <p className="text-text-secondary mb-1 text-sm">Số điện thoại</p>
              <p className="text-text-primary">{transaction.buyer?.phone}</p>
            </div>
            {transaction.buyer?.walletAddress && (
              <div>
                <p className="text-text-secondary mb-1 text-sm">Địa chỉ ví</p>
                <p className="text-text-primary font-mono text-sm">
                  {transaction.buyer.walletAddress.slice(0, 10)}...
                  {transaction.buyer.walletAddress.slice(-8)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        {transaction.orderItems && transaction.orderItems.length > 0 && (
          <div className="bg-background-primary border-border-default rounded-lg border p-4">
            <h3 className="text-text-primary mb-4 text-lg font-semibold">
              Chi tiết đơn hàng
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background-secondary border-border-default border-b">
                  <tr>
                    <th className="text-text-secondary px-4 py-2 text-left text-sm font-medium">
                      Loại vé
                    </th>
                    <th className="text-text-secondary px-4 py-2 text-right text-sm font-medium">
                      Đơn giá
                    </th>
                    <th className="text-text-secondary px-4 py-2 text-right text-sm font-medium">
                      Số lượng
                    </th>
                    <th className="text-text-secondary px-4 py-2 text-right text-sm font-medium">
                      Thành tiền
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border-default divide-y">
                  {transaction.orderItems.map((item, index) => (
                    <tr key={index}>
                      <td className="text-text-primary px-4 py-3 text-sm">
                        {item.ticketType?.name}
                      </td>
                      <td className="text-text-primary px-4 py-3 text-right text-sm">
                        {item.priceAtPurchase?.toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="text-text-primary px-4 py-3 text-right text-sm">
                        {item.quantity}
                      </td>
                      <td className="text-text-primary px-4 py-3 text-right text-sm font-semibold">
                        {item.subtotal?.toLocaleString('vi-VN')} ₫
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Events */}
        {transaction.events && transaction.events.length > 0 && (
          <div className="bg-background-primary border-border-default rounded-lg border p-4">
            <h3 className="text-text-primary mb-4 text-lg font-semibold">
              Sự kiện
            </h3>
            {transaction.events.map((event, index) => (
              <div
                key={index}
                className="border-border-default mb-2 rounded border p-3"
              >
                <p className="text-text-primary font-medium">{event.name}</p>
                <p className="text-text-secondary text-sm">
                  {formatDate(event.startDate)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default TransactionDetailModal;
