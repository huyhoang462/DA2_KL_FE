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

const CategoryDistributionChart = ({ data }) => {
  // Sắp xếp data từ cao xuống thấp sẽ làm chart đẹp hơn rất nhiều
  const chartData = [...data]
    .map((item) => ({
      name: item.name,
      value: item.count,
    }))
    .sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <p className="text-sm font-semibold text-gray-800">
            {payload[0].payload.name}
          </p>
          <p className="text-primary text-sm font-medium">
            {payload[0].value} sự kiện
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    // Tăng height lên để các thanh bar có không gian
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={chartData}
        layout="vertical" // Quan trọng: Chuyển thành chart ngang
        margin={{ top: 10, right: 30, left: 40, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" hide /> {/* Ẩn trục X đi cho gọn */}
        <YAxis
          type="category"
          dataKey="name"
          width={150} // Tăng width để chứa đủ text tiếng Việt
          tick={{ fontSize: 12, fill: '#4B5563' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F3F4F6' }} />
        <Bar
          dataKey="value"
          fill="#0d9488"
          radius={[0, 4, 4, 0]} // Bo góc nhẹ ở đầu thanh bar
          barSize={20}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CategoryDistributionChart;
