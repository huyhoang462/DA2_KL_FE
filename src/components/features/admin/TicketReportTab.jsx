import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Ticket, CheckCircle, XCircle, Archive, Download } from 'lucide-react';
import Button from '../../ui/Button';
import { getTicketReport, exportReport } from '../../../services/adminService';
import LoadingSpinner from '../../ui/LoadingSpinner';
import ErrorDisplay from '../../ui/ErrorDisplay';
import TicketReportSkeleton from '../../ui/TicketReportSkeleton';
import PieChartTooltip from '../../ui/PieChartTooltip';

const TicketReportTab = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const [tempFilters, setTempFilters] = useState(filters);

  const { data, isLoading, error } = useQuery({
    queryKey: ['ticketReport', filters],
    queryFn: () => getTicketReport(filters),
  });

  const handleApplyFilters = () => {
    setFilters(tempFilters);
  };

  const reportData = data?.data;

  const handleExport = async () => {
    try {
      await exportReport({
        reportType: 'tickets',
        ...filters,
      });
      alert('Báo cáo đã được export!');
    } catch (err) {
      console.error('Export error:', err);
      alert('Lỗi khi export báo cáo');
    }
  };

  const STATUS_COLORS = {
    sold: '#10b981',
    cancelled: '#ef4444',
    available: '#3b82f6',
    pending: '#f59e0b',
  };

  const hasFilterChanges = () => {
    return (
      tempFilters.startDate !== filters.startDate ||
      tempFilters.endDate !== filters.endDate
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1">
          <label className="text-text-secondary mb-1 block text-sm font-medium">
            Từ ngày
          </label>
          <input
            type="date"
            value={tempFilters.startDate}
            onChange={(e) =>
              setTempFilters((prev) => ({ ...prev, startDate: e.target.value }))
            }
            className="bg-background-secondary border-border-default text-text-primary focus:border-primary w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="text-text-secondary mb-1 block text-sm font-medium">
            Đến ngày
          </label>
          <input
            type="date"
            value={tempFilters.endDate}
            onChange={(e) =>
              setTempFilters((prev) => ({ ...prev, endDate: e.target.value }))
            }
            className="bg-background-secondary border-border-default text-text-primary focus:border-primary w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
          />
        </div>
        <Button
          onClick={handleApplyFilters}
          variant="primary"
          disabled={!hasFilterChanges()}
        >
          Áp dụng
        </Button>
        <Button onClick={handleExport} variant="info">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {isLoading ? (
        <TicketReportSkeleton />
      ) : error ? (
        <ErrorDisplay error={error} />
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="bg-background-secondary border-border-default rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-medium">
                    Tổng vé
                  </p>
                  <p className="text-text-primary mt-2 text-2xl font-bold">
                    {reportData.summary.totalTickets.toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="bg-primary/10 text-primary rounded-full p-3">
                  <Ticket className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="bg-background-secondary border-border-default rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-medium">
                    Đã bán
                  </p>
                  <p className="text-text-primary mt-2 text-2xl font-bold">
                    {reportData.summary.soldTickets.toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="bg-success/10 text-success rounded-full p-3">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
              <p className="text-text-secondary mt-2 text-sm">
                {(
                  (reportData.summary.soldTickets /
                    reportData.summary.totalTickets) *
                  100
                ).toFixed(1)}
                % tổng vé
              </p>
            </div>

            <div className="bg-background-secondary border-border-default rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-medium">
                    Đã hủy
                  </p>
                  <p className="text-text-primary mt-2 text-2xl font-bold">
                    {reportData.summary.cancelledTickets.toLocaleString(
                      'vi-VN'
                    )}
                  </p>
                </div>
                <div className="bg-destructive/10 text-destructive rounded-full p-3">
                  <XCircle className="h-6 w-6" />
                </div>
              </div>
              <p className="text-destructive mt-2 text-sm font-medium">
                {reportData.summary.cancellationRate.toFixed(1)}% tỷ lệ hủy
              </p>
            </div>

            <div className="bg-background-secondary border-border-default rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-medium">
                    Còn lại
                  </p>
                  <p className="text-text-primary mt-2 text-2xl font-bold">
                    {reportData.summary.availableTickets.toLocaleString(
                      'vi-VN'
                    )}
                  </p>
                </div>
                <div className="bg-info/10 text-info rounded-full p-3">
                  <Archive className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Tickets by Status */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="bg-background-secondary border-border-default rounded-lg border p-6">
              <h3 className="text-text-primary mb-6 text-lg font-semibold">
                Phân bố theo trạng thái
              </h3>
              {reportData.ticketsByStatus &&
              reportData.ticketsByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.ticketsByStatus}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => `${entry.status}: ${entry.count}`}
                    >
                      {reportData.ticketsByStatus.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={STATUS_COLORS[entry.status] || '#6b7280'}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<PieChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-text-secondary flex h-[300px] items-center justify-center">
                  Chưa có dữ liệu
                </div>
              )}
            </div>

            <div className="bg-background-secondary border-border-default rounded-lg border p-6">
              <h3 className="text-text-primary mb-6 text-lg font-semibold">
                Vé theo danh mục
              </h3>
              {reportData.ticketsByCategory &&
              reportData.ticketsByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={reportData.ticketsByCategory
                      .slice(0, 5)
                      .map((cat) => ({
                        ...cat,
                        categoryName: cat.categoryName || cat.name || 'N/A',
                      }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="categoryName" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#ffffff',
                      }}
                    />
                    <Bar dataKey="totalTickets" fill="#3b82f6" name="Tổng vé" />
                    <Bar
                      dataKey="checkedInTickets"
                      fill="#10b981"
                      name="Đã check-in"
                    />
                    <Bar
                      dataKey="pendingTickets"
                      fill="#f59e0b"
                      name="Chờ check-in"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-text-secondary flex h-[300px] items-center justify-center">
                  Chưa có dữ liệu
                </div>
              )}
            </div>
          </div>

          {/* Top Events by Ticket Sales */}
          <div className="bg-background-secondary border-border-default rounded-lg border">
            <div className="border-border-default border-b p-6">
              <h3 className="text-text-primary text-lg font-semibold">
                Top sự kiện bán vé
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background-primary border-border-default border-b">
                  <tr>
                    <th className="text-text-secondary px-6 py-3 text-left text-xs font-medium uppercase">
                      #
                    </th>
                    <th className="text-text-secondary px-6 py-3 text-left text-xs font-medium uppercase">
                      Sự kiện
                    </th>
                    <th className="text-text-secondary px-6 py-3 text-right text-xs font-medium uppercase">
                      Vé đã bán
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border-default divide-y">
                  {reportData.topEventsByTicketSales &&
                  reportData.topEventsByTicketSales.length > 0 ? (
                    reportData.topEventsByTicketSales.map((event, index) => (
                      <tr
                        key={event.eventId}
                        onClick={() =>
                          navigate(`/admin/events/${event.eventId}`)
                        }
                        className="hover:bg-background-primary cursor-pointer transition-colors"
                      >
                        <td className="text-text-secondary px-6 py-4 text-sm">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-text-primary text-sm font-medium">
                            {event.eventName}
                          </p>
                        </td>
                        <td className="text-text-primary px-6 py-4 text-right text-sm font-semibold">
                          {event.ticketsSold.toLocaleString('vi-VN')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="text-text-secondary px-6 py-8 text-center"
                      >
                        Chưa có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TicketReportTab;
