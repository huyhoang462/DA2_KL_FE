import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const RevenueChart = ({ data }) => {
  // Format data cho chart
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
    }),
    'Doanh thu': item.revenue,
    'Vé bán': item.ticketsSold,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background-secondary border-border-default rounded-lg border p-3 shadow-lg">
          <p className="text-text-primary mb-2 text-sm font-semibold">
            {payload[0].payload.date}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}:{' '}
              {entry.name === 'Doanh thu'
                ? `${entry.value.toLocaleString('vi-VN')} VNĐ`
                : `${entry.value} vé`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
        <YAxis
          yAxisId="left"
          stroke="#10B981"
          style={{ fontSize: '12px' }}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#F59E0B"
          style={{ fontSize: '12px' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="Doanh thu"
          stroke="#10B981"
          strokeWidth={2}
          dot={{ fill: '#10B981', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="Vé bán"
          stroke="#F59E0B"
          strokeWidth={2}
          dot={{ fill: '#F59E0B', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RevenueChart;
