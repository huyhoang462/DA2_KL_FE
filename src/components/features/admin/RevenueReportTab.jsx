import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Download,
  DollarSign,
  ShoppingCart,
  CreditCard,
} from 'lucide-react';
import Button from '../../ui/Button';
import PieChartTooltip from '../../ui/PieChartTooltip';
import { getRevenueReport, exportReport } from '../../../services/adminService';
import LoadingSpinner from '../../ui/LoadingSpinner';
import ErrorDisplay from '../../ui/ErrorDisplay';
import RevenueReportSkeleton from '../../ui/RevenueReportSkeleton';

const RevenueReportTab = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    groupBy: 'day',
  });

  const [tempFilters, setTempFilters] = useState(filters);

  const { data, isLoading, error } = useQuery({
    queryKey: ['revenueReport', filters],
    queryFn: () => getRevenueReport(filters),
  });

  const handleApplyFilters = () => {
    setFilters(tempFilters);
  };

  const reportData = data?.data;

  const handleExport = async () => {
    try {
      await exportReport({
        reportType: 'revenue',
        ...filters,
      });
      alert('Báo cáo đã được export!');
    } catch (err) {
      console.error('Export error:', err);
      alert('Lỗi khi export báo cáo');
    }
  };

  const formatDate = (dateObj) => {
    if (filters.groupBy === 'day') {
      return `${dateObj.day}/${dateObj.month}`;
    } else if (filters.groupBy === 'month') {
      return `T${dateObj.month}/${dateObj.year}`;
    } else if (filters.groupBy === 'week') {
      return `W${dateObj.week}`;
    }
    return `${dateObj.year}`;
  };

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M ₫`;
    } else if (value >= 100000) {
      return `${(value / 1000).toFixed(0)}k ₫`;
    }
    return `${value.toLocaleString('vi-VN')} ₫`;
  };

  const COLORS = [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
  ];

  const hasFilterChanges = () => {
    return (
      tempFilters.startDate !== filters.startDate ||
      tempFilters.endDate !== filters.endDate ||
      tempFilters.groupBy !== filters.groupBy
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
        <div className="flex-1">
          <label className="text-text-secondary mb-1 block text-sm font-medium">
            Nhóm theo
          </label>
          <select
            value={tempFilters.groupBy}
            onChange={(e) =>
              setTempFilters((prev) => ({ ...prev, groupBy: e.target.value }))
            }
            className="bg-background-secondary border-border-default text-text-primary focus:border-primary w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
          >
            <option value="day">Ngày</option>
            <option value="week">Tuần</option>
            <option value="month">Tháng</option>
            <option value="year">Năm</option>
          </select>
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
        <RevenueReportSkeleton />
      ) : error ? (
        <ErrorDisplay error={error} />
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="bg-background-secondary border-border-default rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-medium">
                    Tổng doanh thu
                  </p>
                  <p className="text-text-primary mt-2 text-2xl font-bold">
                    {reportData.summary.totalRevenue.toLocaleString('vi-VN')} ₫
                  </p>
                </div>
                <div className="bg-primary/10 text-primary rounded-full p-3">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
              {reportData.summary.growthRate !== undefined && (
                <div
                  className={`mt-3 flex items-center gap-1 text-sm ${
                    reportData.summary.growthRate >= 0
                      ? 'text-success'
                      : 'text-destructive'
                  }`}
                >
                  {reportData.summary.growthRate >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="font-medium">
                    {Math.abs(reportData.summary.growthRate).toFixed(2)}%
                  </span>
                  <span className="text-text-secondary">so với kỳ trước</span>
                </div>
              )}
            </div>

            <div className="bg-background-secondary border-border-default rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-medium">
                    Tổng giao dịch
                  </p>
                  <p className="text-text-primary mt-2 text-2xl font-bold">
                    {reportData.summary.totalTransactions.toLocaleString(
                      'vi-VN'
                    )}
                  </p>
                </div>
                <div className="bg-success/10 text-success rounded-full p-3">
                  <ShoppingCart className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="bg-background-secondary border-border-default rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-medium">
                    Giá trị TB/giao dịch
                  </p>
                  <p className="text-text-primary mt-2 text-2xl font-bold">
                    {reportData.summary.averageTransactionValue.toLocaleString(
                      'vi-VN'
                    )}{' '}
                    ₫
                  </p>
                </div>
                <div className="bg-warning/10 text-warning rounded-full p-3">
                  <CreditCard className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Over Time Chart */}
          <div className="bg-background-secondary border-border-default rounded-lg border p-6">
            <h3 className="text-text-primary mb-6 text-lg font-semibold">
              Doanh thu theo thời gian
            </h3>
            {reportData.revenueByTime && reportData.revenueByTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart
                  data={reportData.revenueByTime.map((item) => ({
                    ...item,
                    date: formatDate(item._id),
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" tickFormatter={formatCurrency} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#ffffff',
                    }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalRevenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Doanh thu"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-text-secondary flex h-[350px] items-center justify-center">
                Chưa có dữ liệu
              </div>
            )}
          </div>

          {/* Revenue by Category Chart */}
          <div className="bg-background-secondary border-border-default rounded-lg border p-6">
            <h3 className="text-text-primary mb-6 text-lg font-semibold">
              Doanh thu theo danh mục
            </h3>
            {reportData.revenueByCategory &&
            reportData.revenueByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={reportData.revenueByCategory
                    .slice(0, 10)
                    .map((cat) => ({
                      ...cat,
                      categoryName: cat.categoryName || cat.name || 'N/A',
                    }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="categoryName" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" tickFormatter={formatCurrency} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#ffffff',
                    }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar dataKey="totalRevenue" fill="#10b981" name="Doanh thu" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-text-secondary flex h-[350px] items-center justify-center">
                Chưa có dữ liệu
              </div>
            )}
          </div>

          {/* Revenue by Payment Method */}
          <div className="bg-background-secondary border-border-default rounded-lg border p-6">
            <h3 className="text-text-primary mb-6 text-lg font-semibold">
              Phân bố theo phương thức thanh toán
            </h3>
            {reportData.revenueByPaymentMethod &&
            reportData.revenueByPaymentMethod.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportData.revenueByPaymentMethod}
                    dataKey="totalRevenue"
                    nameKey="paymentMethod"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) =>
                      `${entry.paymentMethod}: ${((entry.totalRevenue / reportData.summary.totalRevenue) * 100).toFixed(1)}%`
                    }
                  >
                    {reportData.revenueByPaymentMethod.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={<PieChartTooltip formatter={formatCurrency} />}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-text-secondary flex h-[300px] items-center justify-center">
                Chưa có dữ liệu
              </div>
            )}
          </div>

          {/* Top Organizers Table */}
          <div className="bg-background-secondary border-border-default rounded-lg border">
            <div className="border-border-default border-b p-6">
              <h3 className="text-text-primary text-lg font-semibold">
                Top organizers
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
                      Organizer
                    </th>
                    <th className="text-text-secondary px-6 py-3 text-left text-xs font-medium uppercase">
                      Sự kiện
                    </th>
                    <th className="text-text-secondary px-6 py-3 text-left text-xs font-medium uppercase">
                      Giao dịch
                    </th>
                    <th className="text-text-secondary px-6 py-3 text-right text-xs font-medium uppercase">
                      Doanh thu
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border-default divide-y">
                  {reportData.revenueByOrganizer &&
                  reportData.revenueByOrganizer.length > 0 ? (
                    reportData.revenueByOrganizer
                      .slice(0, 10)
                      .map((org, index) => (
                        <tr
                          key={org.organizerId}
                          onClick={() =>
                            navigate(`/admin/users/${org.organizerId}`)
                          }
                          className="hover:bg-background-primary cursor-pointer transition-colors"
                        >
                          <td className="text-text-secondary px-6 py-4 text-sm">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-text-primary text-sm font-medium">
                                {org.organizerName}
                              </p>
                              <p className="text-text-secondary text-xs">
                                {org.organizerEmail}
                              </p>
                            </div>
                          </td>
                          <td className="text-text-primary px-6 py-4 text-sm">
                            {org.totalEvents}
                          </td>
                          <td className="text-text-primary px-6 py-4 text-sm">
                            {org.totalTransactions}
                          </td>
                          <td className="text-text-primary px-6 py-4 text-right text-sm font-semibold">
                            {org.totalRevenue.toLocaleString('vi-VN')} ₫
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
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

export default RevenueReportTab;
