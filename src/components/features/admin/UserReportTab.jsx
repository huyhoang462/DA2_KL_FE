import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
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
  Users,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Download,
} from 'lucide-react';
import Button from '../../ui/Button';
import { getUserReport, exportReport } from '../../../services/adminService';
import LoadingSpinner from '../../ui/LoadingSpinner';
import ErrorDisplay from '../../ui/ErrorDisplay';
import UserReportSkeleton from '../../ui/UserReportSkeleton';

const UserReportTab = () => {
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    groupBy: 'day',
  });

  const [tempFilters, setTempFilters] = useState(filters);

  const { data, isLoading, error } = useQuery({
    queryKey: ['userReport', filters],
    queryFn: () => getUserReport(filters),
  });

  const handleApplyFilters = () => {
    setFilters(tempFilters);
  };

  const reportData = data?.data;

  const handleExport = async () => {
    try {
      await exportReport({
        reportType: 'users',
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
    }
    return `${dateObj.year}`;
  };

  const ROLE_COLORS = ['#3b82f6', '#10b981', '#f59e0b'];
  const STATUS_COLORS = ['#10b981', '#ef4444', '#6b7280'];

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
        <UserReportSkeleton />
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
                    Người dùng mới
                  </p>
                  <p className="text-text-primary mt-2 text-2xl font-bold">
                    {reportData.summary.totalNewUsers.toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="bg-primary/10 text-primary rounded-full p-3">
                  <UserPlus className="h-6 w-6" />
                </div>
              </div>
              {reportData.summary.userGrowthRate !== undefined && (
                <div
                  className={`mt-3 flex items-center gap-1 text-sm ${
                    reportData.summary.userGrowthRate >= 0
                      ? 'text-success'
                      : 'text-destructive'
                  }`}
                >
                  {reportData.summary.userGrowthRate >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="font-medium">
                    {Math.abs(reportData.summary.userGrowthRate).toFixed(2)}%
                  </span>
                </div>
              )}
            </div>

            <div className="bg-background-secondary border-border-default rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-medium">
                    Người mua vé
                  </p>
                  <p className="text-text-primary mt-2 text-2xl font-bold">
                    {reportData.summary.totalBuyers.toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="bg-success/10 text-success rounded-full p-3">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="bg-background-secondary border-border-default rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-medium">
                    Tỷ lệ chuyển đổi
                  </p>
                  <p className="text-text-primary mt-2 text-2xl font-bold">
                    {reportData.summary.conversionRate.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-warning/10 text-warning rounded-full p-3">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
              <p className="text-text-secondary mt-2 text-xs">
                Người dùng mua vé / Tổng người dùng
              </p>
            </div>

            <div className="bg-background-secondary border-border-default rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-medium">
                    Tỷ lệ giữ chân
                  </p>
                  <p className="text-text-primary mt-2 text-2xl font-bold">
                    {reportData.summary.retentionRate.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-info/10 text-info rounded-full p-3">
                  <Users className="h-6 w-6" />
                </div>
              </div>
              <p className="text-text-secondary mt-2 text-xs">
                Người dùng quay lại mua vé
              </p>
            </div>
          </div>

          {/* New Users Over Time */}
          <div className="bg-background-secondary border-border-default rounded-lg border p-6">
            <h3 className="text-text-primary mb-6 text-lg font-semibold">
              Người dùng mới theo thời gian
            </h3>
            {reportData.newUsersByDay && reportData.newUsersByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart
                  data={reportData.newUsersByDay.map((item) => ({
                    ...item,
                    date: formatDate(item._id),
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#ffffff',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Người dùng mới"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-text-secondary flex h-[350px] items-center justify-center">
                Chưa có dữ liệu
              </div>
            )}
          </div>

          {/* Users by Role and Status */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="bg-background-secondary border-border-default rounded-lg border p-6">
              <h3 className="text-text-primary mb-6 text-lg font-semibold">
                Phân bố theo vai trò
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportData.usersByRole}
                    dataKey="count"
                    nameKey="role"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.role}: ${entry.count}`}
                  >
                    {reportData.usersByRole.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={ROLE_COLORS[index % ROLE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#ffffff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-background-secondary border-border-default rounded-lg border p-6">
              <h3 className="text-text-primary mb-6 text-lg font-semibold">
                Phân bố theo trạng thái
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportData.usersByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.status}: ${entry.count}`}
                  >
                    {reportData.usersByStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#ffffff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Buyers */}
          <div className="bg-background-secondary border-border-default rounded-lg border">
            <div className="border-border-default border-b p-6">
              <h3 className="text-text-primary text-lg font-semibold">
                Top người mua vé
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
                      Người dùng
                    </th>
                    <th className="text-text-secondary px-6 py-3 text-right text-xs font-medium uppercase">
                      Số đơn
                    </th>
                    <th className="text-text-secondary px-6 py-3 text-right text-xs font-medium uppercase">
                      Tổng chi tiêu
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border-default divide-y">
                  {reportData.topBuyers && reportData.topBuyers.length > 0 ? (
                    reportData.topBuyers.map((buyer, index) => (
                      <tr
                        key={buyer.userId}
                        className="hover:bg-background-primary"
                      >
                        <td className="text-text-secondary px-6 py-4 text-sm">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-text-primary text-sm font-medium">
                              {buyer.fullName}
                            </p>
                            <p className="text-text-secondary text-xs">
                              {buyer.email}
                            </p>
                          </div>
                        </td>
                        <td className="text-text-primary px-6 py-4 text-right text-sm">
                          {buyer.totalOrders.toLocaleString('vi-VN')}
                        </td>
                        <td className="text-text-primary px-6 py-4 text-right text-sm font-semibold">
                          {buyer.totalSpent.toLocaleString('vi-VN')} ₫
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
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

export default UserReportTab;
