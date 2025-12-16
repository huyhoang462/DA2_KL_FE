// src/components/features/organizer/RecentOrdersCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function RecentOrdersCard({ data, eventId }) {
  // Safety check for data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="border-border-default bg-background-secondary rounded-lg border p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-text-primary text-base font-semibold">
            Đơn hàng gần đây
          </h3>
          <Link
            to={`/manage/event/${eventId}/orders`}
            className="text-primary text-sm font-medium hover:underline"
          >
            Xem tất cả
          </Link>
        </div>
        <div className="flex h-32 items-center justify-center text-gray-500">
          Chưa có đơn hàng nào
        </div>
      </div>
    );
  }

  return (
    <div className="border-border-default bg-background-secondary rounded-lg border p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-text-primary text-base font-semibold">
          Đơn hàng gần đây
        </h3>
        <Link
          to={`/manage/event/${eventId}/orders`}
          className="text-primary text-sm font-medium hover:underline"
        >
          Xem tất cả
        </Link>
      </div>
      <div className="space-y-4">
        {data.map((order, index) => (
          <div
            key={order.id}
            className={`flex items-center justify-between ${index < data.length - 1 ? 'border-border-subtle border-b pb-4' : ''}`}
          >
            <div>
              <p className="text-text-primary font-medium">
                {order.customerName}
              </p>
              <p className="text-text-secondary text-xs">
                {formatDistanceToNow(new Date(order.createdAt), {
                  addSuffix: true,
                  locale: vi,
                })}{' '}
                - {order.ticketCount} vé
              </p>
            </div>
            <p className="text-text-primary font-semibold">
              {order.totalAmount.toLocaleString('vi-VN')} đ
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
