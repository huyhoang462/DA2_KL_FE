// src/components/features/organizer/RevenueChart.jsx
import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Calendar, TrendingUp, DollarSign } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="border-border-default rounded-lg border bg-white px-4 py-3 shadow-lg backdrop-blur-sm">
        <div className="mb-2 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <p className="text-sm font-medium text-gray-900">{`${label}`}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-primary h-3 w-3 rounded-full" />
          <span className="text-sm text-gray-600">Doanh thu:</span>
          <span className="text-primary font-bold">{`${payload[0].value.toLocaleString('vi-VN')}đ`}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ data, summary, groupBy }) {
  // Safety check for data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="border-border-default rounded-xl border bg-white p-6">
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          Doanh thu theo {groupBy === 'hour' ? 'giờ' : 'ngày'}
        </h3>
        <div className="text-text-secondary flex h-[320px] items-center justify-center">
          Chưa có dữ liệu doanh thu
        </div>
      </div>
    );
  }

  const formattedData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      ...(groupBy === 'hour' && { hour: '2-digit', minute: '2-digit' }),
    }),
  }));

  const totalRevenue =
    summary?.totalRevenue || data.reduce((sum, item) => sum + item.revenue, 0);
  const avgDaily = summary?.avgDailyRevenue || totalRevenue / data.length;
  const maxRevenue =
    summary?.peakDate?.revenue || Math.max(...data.map((item) => item.revenue));
  const peakDate = summary?.peakDate?.date
    ? new Date(summary.peakDate.date).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
      })
    : null;

  return (
    <div className="border-border-default rounded-xl border bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-text-primary mb-2 text-lg font-semibold">
            Doanh thu theo {groupBy === 'hour' ? 'giờ' : 'ngày'}
          </h3>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>
                Trung bình: {avgDaily.toLocaleString('vi-VN')}đ/
                {groupBy === 'hour' ? 'giờ' : 'ngày'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>
                Cao nhất: {maxRevenue.toLocaleString('vi-VN')}đ
                {peakDate && ` (${peakDate})`}
              </span>
            </div>
            {summary?.totalOrders && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Tổng: {summary.totalOrders} đơn, {summary.totalTickets} vé
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[320px] w-full">
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={300}
          minHeight={320}
        >
          <BarChart
            data={formattedData}
            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            barCategoryGap="20%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}tr`}
              dx={-10}
            />
            <Tooltip
              cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
              content={<CustomTooltip />}
            />
            <Bar
              dataKey="revenue"
              fill="url(#colorGradient)"
              radius={[6, 6, 0, 0]}
              maxBarSize={60}
            />

            {/* Gradient definition */}
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.8} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
