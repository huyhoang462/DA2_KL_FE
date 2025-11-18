// src/pages/payment/partials/CartInfoCard.jsx
import React from 'react';
import useCartSummary from '../../../hooks/useCartSummary';

export default function CartInfoCard({ event }) {
  const { summaryItems, totalAmount } = useCartSummary(event);

  return (
    <div className="border-border-default bg-background-secondary rounded-lg border p-6">
      <h3 className="text-text-primary mb-4 text-lg font-bold">
        Chi tiết đơn hàng
      </h3>
      <div className="space-y-2">
        {summaryItems.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-text-primary">
              {item.name}{' '}
              <span className="text-text-secondary">x{item.quantity}</span>
            </span>
            <span className="text-text-secondary font-medium">
              {item.subtotal.toLocaleString()} đ
            </span>
          </div>
        ))}
      </div>
      <div className="border-border-default mt-4 flex justify-between border-t pt-4 text-lg font-bold">
        <span className="text-text-primary">Thành tiền</span>
        <span className="text-primary">{totalAmount.toLocaleString()} VNĐ</span>
      </div>
    </div>
  );
}
