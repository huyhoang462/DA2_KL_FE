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
    data.orderCount > 0 ? data.grossRevenue / data.orderCount : 0;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <MetricItem
        icon={DollarSign}
        label="Tổng doanh thu"
        value={`${data.grossRevenue.toLocaleString('vi-VN')}đ`}
        trend="+12.5%"
        subValue={`Trung bình: ${avgOrderValue.toLocaleString('vi-VN')}đ/đơn`}
      />
      <MetricItem
        icon={Ticket}
        label="Vé đã bán"
        value={`${data.ticketsSold.toLocaleString('vi-VN')}`}
        trend={`${salesRate}%`}
        subValue={`Còn lại: ${(data.totalTickets - data.ticketsSold).toLocaleString('vi-VN')} vé`}
      />
      <MetricItem
        icon={ShoppingCart}
        label="Tổng đơn hàng"
        value={data.orderCount.toLocaleString('vi-VN')}
        trend="+8.3%"
        subValue={`Trung bình: ${(data.ticketsSold / data.orderCount || 0).toFixed(1)} vé/đơn`}
      />
    </div>
  );
}
