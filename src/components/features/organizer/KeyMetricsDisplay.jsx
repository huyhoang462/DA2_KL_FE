// src/components/features/organizer/KeyMetricsDisplay.jsx
import React from 'react';
import { Ticket, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';

const MetricItem = ({ icon: Icon, label, value, trend, subValue }) => (
  <div className="group hover:border-primary/20 relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="mb-3 flex items-center gap-3">
          <div className="bg-primary/10 text-primary group-hover:bg-primary/15 flex h-12 w-12 items-center justify-center rounded-xl transition-colors">
            <Icon className="h-6 w-6" />
          </div>
          {/* {trend && (
            <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-600">
                {trend}
              </span>
            </div>
          )} */}
          <p className="mb-1 text-sm font-medium text-gray-600">{label}</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subValue && <p className="mt-1 text-xs text-gray-500">{subValue}</p>}
        </div>
      </div>
    </div>

    {/* Gradient accent */}
    <div className="from-primary to-primary/60 absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r transition-all duration-300 group-hover:w-full" />
  </div>
);

export default function KeyMetricsDisplay({ data }) {
  const salesRate = ((data.ticketsSold / data.totalTickets) * 100).toFixed(1);
  const avgOrderValue =
    data.totalOrders > 0 ? data.totalRevenue / data.totalOrders : 0;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <MetricItem
        icon={DollarSign}
        label="Tổng doanh thu"
        value={`${data.totalRevenue.toLocaleString('vi-VN')}đ`}
        subValue={`TB/đơn: ${data.revenuePerOrder.toLocaleString('vi-VN')}đ`}
      />
      <MetricItem
        icon={Ticket}
        label="Vé đã bán"
        value={`${data.ticketsSold.toLocaleString('vi-VN')} / ${data.totalTickets.toLocaleString('vi-VN')}`}
        subValue={`Tỷ lệ: ${salesRate}%`}
      />
      <MetricItem
        icon={ShoppingCart}
        label="Đơn hàng"
        value={data.totalOrders.toLocaleString('vi-VN')}
        subValue={
          data.pendingOrders > 0
            ? `${data.pendingOrders} đang chờ`
            : 'Không có đơn chờ'
        }
      />
      <MetricItem
        icon={TrendingUp}
        label="Tỷ lệ chuyển đổi"
        value={`${data.conversionRate}%`}
        subValue={`TB: ${data.avgTicketsPerOrder} vé/đơn`}
      />
    </div>
  );
}
