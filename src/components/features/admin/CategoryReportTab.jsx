import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Folder,
  Calendar,
  Ticket,
  DollarSign,
  ArrowUpDown,
} from 'lucide-react';
import { getCategoryReport } from '../../../services/adminService';
import ErrorDisplay from '../../ui/ErrorDisplay';
import CategoryReportSkeleton from '../../ui/CategoryReportSkeleton';

const CategoryReportTab = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['categoryReport'],
    queryFn: getCategoryReport,
  });

  const categories = data?.data || [];

  const [sortBy, setSortBy] = React.useState('totalRevenue');
  const [sortOrder, setSortOrder] = React.useState('desc');

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedCategories = [...categories].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const totalRevenue = categories.reduce(
    (sum, cat) => sum + cat.totalRevenue,
    0
  );
  const totalEvents = categories.reduce((sum, cat) => sum + cat.totalEvents, 0);
  const totalActiveEvents = categories.reduce(
    (sum, cat) => sum + cat.activeEvents,
    0
  );
  const totalTickets = categories.reduce(
    (sum, cat) => sum + cat.totalTicketsSold,
    0
  );

  return (
    <div className="space-y-6">
      {isLoading ? (
        <CategoryReportSkeleton />
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
                    Tổng danh mục
                  </p>
                  <p className="text-text-primary mt-2 text-2xl font-bold">
                    {categories.length}
                  </p>
                </div>
                <div className="bg-primary/10 text-primary rounded-full p-3">
                  <Folder className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="bg-background-secondary border-border-default rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-medium">
                    Tổng sự kiện
                  </p>
                  <p className="text-text-primary mt-2 text-2xl font-bold">
                    {totalEvents.toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="bg-success/10 text-success rounded-full p-3">
                  <Calendar className="h-6 w-6" />
                </div>
              </div>
              <p className="text-text-secondary mt-2 text-sm">
                {totalActiveEvents} đang hoạt động
              </p>
            </div>

            <div className="bg-background-secondary border-border-default rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-medium">
                    Tổng vé đã bán
                  </p>
                  <p className="text-text-primary mt-2 text-2xl font-bold">
                    {totalTickets.toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="bg-warning/10 text-warning rounded-full p-3">
                  <Ticket className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="bg-background-secondary border-border-default rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-medium">
                    Tổng doanh thu
                  </p>
                  <p className="text-text-primary mt-2 text-2xl font-bold">
                    {(totalRevenue / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div className="bg-info/10 text-info rounded-full p-3">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Categories Table */}
          <div className="bg-background-secondary border-border-default rounded-lg border">
            <div className="border-border-default border-b p-6">
              <h3 className="text-text-primary text-lg font-semibold">
                Chi tiết theo danh mục
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background-primary border-border-default border-b">
                  <tr>
                    <th className="text-text-secondary px-6 py-3 text-left text-xs font-medium uppercase">
                      Danh mục
                    </th>
                    <th
                      className="text-text-secondary hover:text-text-primary cursor-pointer px-6 py-3 text-right text-xs font-medium uppercase"
                      onClick={() => handleSort('totalEvents')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Sự kiện
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th
                      className="text-text-secondary hover:text-text-primary cursor-pointer px-6 py-3 text-right text-xs font-medium uppercase"
                      onClick={() => handleSort('activeEvents')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Đang hoạt động
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th
                      className="text-text-secondary hover:text-text-primary cursor-pointer px-6 py-3 text-right text-xs font-medium uppercase"
                      onClick={() => handleSort('totalTicketsSold')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Vé đã bán
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th
                      className="text-text-secondary hover:text-text-primary cursor-pointer px-6 py-3 text-right text-xs font-medium uppercase"
                      onClick={() => handleSort('totalRevenue')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Doanh thu
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="text-text-secondary px-6 py-3 text-right text-xs font-medium uppercase">
                      % Doanh thu
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border-default divide-y">
                  {sortedCategories.map((category) => {
                    const revenuePercentage =
                      totalRevenue > 0
                        ? (category.totalRevenue / totalRevenue) * 100
                        : 0;

                    return (
                      <tr
                        key={category._id}
                        className="hover:bg-background-primary"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 text-primary rounded-lg p-2">
                              <Folder className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-text-primary text-sm font-medium">
                                {category.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="text-text-primary px-6 py-4 text-right text-sm">
                          {category.totalEvents}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="bg-success/10 text-success inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                            {category.activeEvents}
                          </span>
                        </td>
                        <td className="text-text-primary px-6 py-4 text-right text-sm font-medium">
                          {category.totalTicketsSold.toLocaleString('vi-VN')}
                        </td>
                        <td className="text-text-primary px-6 py-4 text-right text-sm font-semibold">
                          {category.totalRevenue.toLocaleString('vi-VN')} ₫
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="bg-background-primary h-2 w-20 overflow-hidden rounded-full">
                              <div
                                className="bg-primary h-full"
                                style={{ width: `${revenuePercentage}%` }}
                              />
                            </div>
                            <span className="text-text-primary text-sm font-medium">
                              {revenuePercentage.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryReportTab;
