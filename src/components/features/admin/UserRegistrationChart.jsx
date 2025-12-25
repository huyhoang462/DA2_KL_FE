import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const UserRegistrationChart = ({ data }) => {
  // Format data cho chart
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
    }),
    'Người dùng mới': item.count,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background-secondary border-border-default rounded-lg border p-3 shadow-lg">
          <p className="text-text-primary mb-1 text-sm font-semibold">
            {payload[0].payload.date}
          </p>
          <p className="text-primary text-sm font-medium">
            {payload[0].value} người dùng mới
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
        <YAxis
          stroke="#9CA3AF"
          style={{ fontSize: '12px' }}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="Người dùng mới" fill="#3B82F6" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default UserRegistrationChart;
