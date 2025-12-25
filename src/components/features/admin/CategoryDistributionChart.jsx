import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
];

const CategoryDistributionChart = ({ data }) => {
  // Format data cho chart
  const chartData = data.map((item) => ({
    name: item.name,
    value: item.count,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background-secondary border-border-default rounded-lg border p-3 shadow-lg">
          <p className="text-text-primary text-sm font-semibold">
            {payload[0].name}
          </p>
          <p className="text-primary text-sm font-medium">
            {payload[0].value} sự kiện
          </p>
          <p className="text-text-secondary text-xs">
            {((payload[0].percent || 0) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label
  const renderLabel = (entry) => {
    return `${entry.name} (${entry.value})`;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          wrapperStyle={{ fontSize: '12px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryDistributionChart;
