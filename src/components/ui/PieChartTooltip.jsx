import React from 'react';

const PieChartTooltip = ({ active, payload, formatter, labelFormatter }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const label = labelFormatter ? labelFormatter(data.name) : data.name;
    const value = formatter ? formatter(data.value) : data.value;
    const percent = data.percent ? (data.percent * 100).toFixed(1) : 0;

    return (
      <div className="bg-background-secondary border-border-default rounded-lg border p-3 shadow-lg">
        <p className="text-text-primary text-sm font-semibold">{label}</p>
        <p className="text-primary mt-1 text-sm font-medium">{value}</p>
        {data.percent !== undefined && (
          <p className="text-text-secondary mt-0.5 text-xs">{percent}%</p>
        )}
      </div>
    );
  }
  return null;
};

export default PieChartTooltip;
