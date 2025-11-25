import React from 'react';
import { Link } from 'react-router-dom';
import useCartSummary from '../../../hooks/useCartSummary';

export default function CartInfoCard({ event }) {
  const { summaryItems, totalAmount } = useCartSummary(event);

  return (
    <div className="border-border-default bg-background-secondary rounded-lg border p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-text-primary text-lg font-bold">
          Tóm tắt đơn hàng
        </h3>
        <Link
          to={`/select-tickets/${event.id}`}
          className="text-primary hover:text-primary/80 text-sm font-medium underline"
        >
          Chọn lại vé
        </Link>
      </div>

      <div className="border-border-subtle mt-4 flex items-start gap-4 border-b pb-4">
        <img
          src={event.bannerImageUrl}
          alt={event.name}
          className="h-20 w-20 flex-shrink-0 rounded-md object-cover"
        />
        <div>
          <h4 className="text-text-primary leading-tight font-semibold">
            {event.name}
          </h4>
          <p className="text-text-secondary text-sm"></p>
        </div>
      </div>

      <div className="border-border-subtle mt-4 space-y-2 border-b pb-4">
        {summaryItems.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <p className="text-text-primary">
              {item.name}{' '}
              <span className="text-text-secondary">x{item.quantity}</span>
            </p>
            <p className="text-text-secondary font-medium">
              {item.subtotal.toLocaleString()} đ
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between text-lg font-bold">
        <span className="text-text-primary">Thành tiền</span>
        <span className="text-primary">{totalAmount.toLocaleString()} VNĐ</span>
      </div>
    </div>
  );
}
