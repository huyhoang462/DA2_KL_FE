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
  // ✅ Flatten all tickets với tên unique (thêm show name nếu cần)
  const allTickets = data.flatMap((show) =>
    show.tickets.map((ticket) => {
      // Tạo unique name: nếu có ticket trùng tên thì thêm show name
      const ticketNames = data.flatMap((s) => s.tickets.map((t) => t.name));
      const duplicateCount = ticketNames.filter(
        (name) => name === ticket.name
      ).length;

      return {
        ...ticket,
        uniqueName:
          duplicateCount > 1
            ? `${ticket.name} (${show.showName})`
            : ticket.name,
        originalName: ticket.name,
        showName: show.showName,
      };
    })
  );

  // ✅ Sort by sold quantity (descending)
  const sortedTickets = allTickets.sort((a, b) => b.sold - a.sold);

  // ✅ Take top tickets and group the rest as "Khác"
  const topTickets = sortedTickets.slice(0, MAX_VISIBLE_TICKETS);
  const otherTickets = sortedTickets.slice(MAX_VISIBLE_TICKETS);

  const chartData = topTickets.map((ticket, index) => ({
    ...ticket,
    name: ticket.uniqueName,
    fill: COLORS[index % COLORS.length],
  }));

  // ✅ Add "Khác" category if there are remaining tickets
  if (otherTickets.length > 0) {
    const otherTotal = otherTickets.reduce(
      (sum, ticket) => sum + ticket.sold,
      0
    );
    chartData.push({
      name: `Khác (${otherTickets.length} loại)`,
      sold: otherTotal,
      fill: OTHER_COLOR,
      isOther: true,
      otherTickets: otherTickets, // Store for tooltip details
    });
  }

  return {
    chartData,
    totalSold: allTickets.reduce((sum, ticket) => sum + ticket.sold, 0),
    totalTypes: allTickets.length,
  };
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const { chartData } = processTicketData(window.ticketBreakdownData || []);
    const totalSold = chartData.reduce((sum, item) => sum + item.sold, 0);
    const percentage = ((data.sold / totalSold) * 100).toFixed(1);

    return (
      <div className="max-w-xs rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg">
        <div className="mb-2 flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: data.fill }}
          />
          <span className="font-medium text-gray-900">{data.name}</span>
        </div>
        <div className="space-y-1 text-sm text-gray-600">
          <p>
            Đã bán:{' '}
            <span className="font-semibold text-gray-900">{data.sold} vé</span>
          </p>
          <p>
            Tỷ lệ:{' '}
            <span className="text-primary font-semibold">{percentage}%</span>
          </p>
          {/* Show details for "Khác" category */}
          {data.isOther && data.otherTickets && (
            <div className="mt-2 border-t border-gray-100 pt-2">
              <p className="mb-1 text-xs text-gray-500">Bao gồm:</p>
              <div className="max-h-20 space-y-1 overflow-y-auto">
                {data.otherTickets.slice(0, 5).map((ticket, idx) => (
                  <div key={idx} className="text-xs text-gray-600">
                    • {ticket.uniqueName}: {ticket.sold} vé
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
  // Store data globally for tooltip access
  window.ticketBreakdownData = data;

  const { chartData, totalSold, totalTypes } = processTicketData(data);
  const totalShows = data.length;
  const avgTicketsPerShow =
    totalShows > 0 ? (totalSold / totalShows).toFixed(1) : 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Phân loại vé đã bán
        </h3>

        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <Ticket className="text-primary mx-auto mb-1 h-5 w-5" />
            <p className="text-2xl font-bold text-gray-900">{totalSold}</p>
            <p className="text-xs text-gray-600">Tổng vé bán</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <Eye className="text-primary mx-auto mb-1 h-5 w-5" />
            <p className="text-2xl font-bold text-gray-900">{totalShows}</p>
            <p className="text-xs text-gray-600">Suất diễn</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <Users className="text-primary mx-auto mb-1 h-5 w-5" />
            <p className="text-2xl font-bold text-gray-900">
              {avgTicketsPerShow}
            </p>
            <p className="text-xs text-gray-600">TB/suất</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <MoreHorizontal className="text-primary mx-auto mb-1 h-5 w-5" />
            <p className="text-2xl font-bold text-gray-900">{totalTypes}</p>
            <p className="text-xs text-gray-600">Loại vé</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart */}
        <div className="flex items-center justify-center">
          <div className="h-[320px] w-[320px]">
            <ResponsiveContainer width="100%" height="100%">
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
        </div>

        {/* Legend + Show details */}
        <div className="space-y-6">
          {/* Legend */}
          {/* <div>
            <h4 className="mb-3 text-sm font-medium text-gray-900">
              Chú thích:
            </h4>
            <CustomLegend
              payload={chartData.map((item) => ({
                value: item.name,
                color: item.fill,
              }))}
            />
          </div> */}

          {/* Show details */}
          <div className="mt-6">
            <h4 className="mb-3 text-sm font-medium text-gray-900">
              Chi tiết theo suất diễn:
            </h4>
            <div className="max-h-64 space-y-3 overflow-y-auto">
              {data.map((show, showIndex) => (
                <div key={show.showId} className="rounded-lg bg-gray-50 p-3">
                  <p className="mb-2 text-sm font-semibold text-gray-900">
                    {show.showName}
                  </p>
                  <div className="grid grid-cols-1 gap-1">
                    {show.tickets
                      .sort((a, b) => b.sold - a.sold) // Sort by sold quantity
                      .map((ticket, ticketIndex) => {
                        const colorIndex = chartData.findIndex(
                          (item) =>
                            item.originalName === ticket.name &&
                            item.showName === show.showName
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
                                {ticket.name}
                              </span>
                            </div>
                            <span className="font-semibold text-gray-900">
                              {ticket.sold} vé
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
