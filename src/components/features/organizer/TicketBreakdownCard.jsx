// src/components/features/organizer/TicketBreakdownCard.jsx
import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Ticket, Users, Eye, MoreHorizontal } from 'lucide-react';

// Color palette for tickets
const COLORS = [
  '#3b82f6',
  '#ef4444',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#84cc16',
  '#ec4899',
  '#6366f1',
];

const OTHER_COLOR = '#94a3b8'; // Gray color for "Khác"
const MAX_VISIBLE_TICKETS = 8; // Hiển thị tối đa 8 loại vé

const processTicketData = (data) => {
  // Use byType array from API
  const allTickets = data.byType || [];

  // Sort by sold quantity (descending)
  const sortedTickets = allTickets.sort(
    (a, b) => b.soldQuantity - a.soldQuantity
  );

  // Take top tickets and group the rest as "Khác"
  const topTickets = sortedTickets.slice(0, MAX_VISIBLE_TICKETS);
  const otherTickets = sortedTickets.slice(MAX_VISIBLE_TICKETS);

  const chartData = topTickets.map((ticket, index) => ({
    ...ticket,
    name: `${ticket.ticketTypeName} (${ticket.showName})`,
    sold: ticket.soldQuantity,
    fill: COLORS[index % COLORS.length],
  }));

  // Add "Khác" category if there are remaining tickets
  if (otherTickets.length > 0) {
    const otherTotal = otherTickets.reduce(
      (sum, ticket) => sum + ticket.soldQuantity,
      0
    );
    chartData.push({
      name: `Khác (${otherTickets.length} loại)`,
      sold: otherTotal,
      fill: OTHER_COLOR,
      isOther: true,
      otherTickets: otherTickets,
    });
  }

  return {
    chartData,
    totalSold:
      data.summary?.soldTickets ||
      allTickets.reduce((sum, ticket) => sum + ticket.soldQuantity, 0),
    totalTypes: data.summary?.totalTicketTypes || allTickets.length,
  };
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const totalSold = window.ticketBreakdownTotalSold || data.sold;
    const percentage = ((data.sold / totalSold) * 100).toFixed(1);

    return (
      <div className="border-border-default b g-white max-w-xs rounded-lg border px-4 py-3 shadow-lg">
        <div className="mb-2 flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: data.fill }}
          />
          <span className="text-text-primary font-medium">{data.name}</span>
        </div>
        <div className="text-text-secondary space-y-1 text-sm">
          <p>
            Đã bán:{' '}
            <span className="text-text-primary font-semibold">
              {data.sold} vé
            </span>
          </p>
          <p>
            Tỷ lệ:{' '}
            <span className="text-primary font-semibold">{percentage}%</span>
          </p>
          {data.price && (
            <p>
              Giá:{' '}
              <span className="text-text-primary font-semibold">
                {data.price.toLocaleString('vi-VN')}đ
              </span>
            </p>
          )}
          {/* Show details for "Khác" category */}
          {data.isOther && data.otherTickets && (
            <div className="mt-2 border-t border-gray-100 pt-2">
              <p className="mb-1 text-xs text-gray-500">Bao gồm:</p>
              <div className="max-h-20 space-y-1 overflow-y-auto">
                {data.otherTickets.slice(0, 5).map((ticket, idx) => (
                  <div key={idx} className="text-text-secondary text-xs">
                    • {ticket.ticketTypeName} ({ticket.showName}):{' '}
                    {ticket.soldQuantity} vé
                  </div>
                ))}
                {data.otherTickets.length > 5 && (
                  <div className="text-xs text-gray-400">
                    ... và {data.otherTickets.length - 5} loại khác
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }) => (
  <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-3">
    {payload.map((entry, index) => (
      <div key={index} className="flex items-center gap-2 text-sm">
        <div
          className="h-3 w-3 flex-shrink-0 rounded-full"
          style={{ backgroundColor: entry.color }}
        />
        <span className="truncate text-gray-700" title={entry.value}>
          {entry.value}
        </span>
      </div>
    ))}
  </div>
);

export default function TicketBreakdownCard({ data }) {
  // Safety check for data
  console.log('DATA: ', data);

  if (
    !data ||
    !data.byType ||
    !Array.isArray(data.byType) ||
    data.byType.length === 0
  ) {
    return (
      <div className="border-border-default rounded-xl border bg-white p-6">
        <h3 className="text-text-primary mb-4 text-lg font-semibold">
          Phân loại vé đã bán
        </h3>
        <div className="text-text-secondary flex h-[320px] items-center justify-center">
          Chưa có dữ liệu vé bán
        </div>
      </div>
    );
  }

  const { chartData, totalSold, totalTypes } = processTicketData(data);

  // Store for tooltip
  window.ticketBreakdownData = data;
  window.ticketBreakdownTotalSold = totalSold;

  const summary = data.summary || {};
  const byShow = data.byShow || [];
  const totalShows = summary.totalShows || byShow.length;
  const avgTicketsPerShow =
    totalShows > 0 ? (totalSold / totalShows).toFixed(1) : 0;

  return (
    <div className="border-border-default rounded-xl border bg-white p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-text-primary mb-4 text-lg font-semibold">
          Phân loại vé đã bán
        </h3>

        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <Ticket className="text-primary mx-auto mb-1 h-5 w-5" />
            <p className="text-text-primary text-2xl font-bold">
              {summary.soldTickets || totalSold}
            </p>
            <p className="text-text-secondary text-xs">Tổng vé bán</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <Eye className="text-primary mx-auto mb-1 h-5 w-5" />
            <p className="text-text-primary text-2xl font-bold">{totalShows}</p>
            <p className="text-text-secondary text-xs">Suất diễn</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <Users className="text-primary mx-auto mb-1 h-5 w-5" />
            <p className="text-text-primary text-2xl font-bold">
              {avgTicketsPerShow}
            </p>
            <p className="text-text-secondary text-xs">TB/suất</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <MoreHorizontal className="text-primary mx-auto mb-1 h-5 w-5" />
            <p className="text-text-primary text-2xl font-bold">{totalTypes}</p>
            <p className="text-text-secondary text-xs">Loại vé</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart */}
        <div className="flex items-center justify-center">
          {data.summary.soldTickets === 0 ? (
            <div className="text-text-secondary">Chưa có dữ liệu vé bán</div>
          ) : (
            <div className="h-[320px] w-[320px]">
              <ResponsiveContainer
                width={320}
                height={320}
                minWidth={320}
                minHeight={320}
              >
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={chartData}
                    dataKey="sold"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={50}
                    paddingAngle={2}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        {/* Show details */}
        <div className="space-y-6">
          <div>
            <h4 className="text-text-primary mb-3 text-sm font-medium">
              Chi tiết theo suất diễn:
            </h4>
            <div className="max-h-80 space-y-3 overflow-y-auto">
              {byShow.map((show) => {
                const showTickets = (data.byType || []).filter(
                  (t) => t.showName === show.showName
                );

                return (
                  <div key={show.showId} className="rounded-lg bg-gray-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-text-primary text-sm font-semibold">
                        {show.showName}
                      </p>
                      <span className="text-text-secondary text-xs">
                        {show.soldTickets}/{show.totalTickets} vé
                      </span>
                    </div>
                    <div className="space-y-1">
                      {showTickets
                        .sort((a, b) => b.soldQuantity - a.soldQuantity)
                        .map((ticket) => {
                          const colorIndex = chartData.findIndex(
                            (item) => item.ticketTypeId === ticket.ticketTypeId
                          );
                          const color =
                            colorIndex >= 0
                              ? chartData[colorIndex].fill
                              : OTHER_COLOR;

                          return (
                            <div
                              key={ticket.ticketTypeId}
                              className="flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-2 w-2 flex-shrink-0 rounded-full"
                                  style={{ backgroundColor: color }}
                                />
                                <span className="text-gray-700">
                                  {ticket.ticketTypeName}
                                </span>
                              </div>
                              <span className="text-text-primary font-semibold">
                                {ticket.soldQuantity} vé
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
