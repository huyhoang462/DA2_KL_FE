import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import Button from '../../ui/Button';
import LoadingSpinner from '../../ui/LoadingSpinner';
import ErrorDisplay from '../../ui/ErrorDisplay';
import { getUserEvents } from '../../../services/adminService';

const UserEventsTab = ({ userId }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['userEvents', userId, page, filters],
    queryFn: () =>
      getUserEvents(userId, {
        page,
        limit: 10,
        ...filters,
      }),
    enabled: !!userId,
  });

  const events = data?.data?.events || [];
  const statistics = data?.data?.statistics;
  const pagination = data?.data?.pagination;

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: {
        bg: 'bg-gray-100 text-gray-800',
        label: 'Bản nháp',
      },
      pending: {
        bg: 'bg-yellow-100 text-yellow-800',
        label: 'Chờ duyệt',
      },
      upcoming: {
        bg: 'bg-blue-100 text-blue-800',
        label: 'Sắp diễn ra',
      },
      ongoing: {
        bg: 'bg-green-100 text-green-800',
        label: 'Đang diễn ra',
      },
      completed: {
        bg: 'bg-purple-100 text-purple-800',
        label: 'Hoàn thành',
      },
      cancelled: {
        bg: 'bg-red-100 text-red-800',
        label: 'Đã hủy',
      },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span
        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${config.bg}`}
      >
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="bg-background-primary border-border-default rounded-lg border p-4">
            <p className="text-text-secondary text-sm font-medium">
              Tổng sự kiện
            </p>
            <p className="text-text-primary mt-2 text-2xl font-bold">
              {statistics.total}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="text-text-secondary">
                Draft: {statistics.draft}
              </span>
              <span className="text-text-secondary">
                Published: {statistics.published}
              </span>
              <span className="text-text-secondary">
                Completed: {statistics.completed}
              </span>
            </div>
          </div>
          <div className="bg-background-primary border-border-default rounded-lg border p-4">
            <p className="text-text-secondary text-sm font-medium">
              Tổng doanh thu
            </p>
            <p className="text-success mt-2 text-2xl font-bold">
              {((statistics.totalRevenue || 0) / 1000000).toFixed(1)}M
            </p>
            <p className="text-text-secondary mt-1 text-xs">VNĐ</p>
          </div>
          <div className="bg-background-primary border-border-default rounded-lg border p-4">
            <p className="text-text-secondary text-sm font-medium">Vé bán</p>
            <p className="text-primary mt-2 text-2xl font-bold">
              {statistics.totalSoldTickets || 0}
            </p>
            <p className="text-text-secondary mt-1 text-xs">vé</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="bg-background-primary border-border-default text-text-primary focus:border-primary rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="draft">Bản nháp</option>
          <option value="pending">Chờ duyệt</option>
          <option value="upcoming">Sắp diễn ra</option>
          <option value="ongoing">Đang diễn ra</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>

        <input
          type="date"
          value={filters.startDate}
          onChange={(e) =>
            setFilters({ ...filters, startDate: e.target.value })
          }
          className="bg-background-primary border-border-default text-text-primary focus:border-primary rounded-lg border px-3 py-2 text-sm"
          placeholder="Từ ngày"
        />

        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          className="bg-background-primary border-border-default text-text-primary focus:border-primary rounded-lg border px-3 py-2 text-sm"
          placeholder="Đến ngày"
        />
      </div>

      {/* Events Table */}
      <div className="bg-background-primary border-border-default overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-secondary border-border-default border-b">
              <tr>
                <th className="text-text-secondary px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                  Sự kiện
                </th>
                <th className="text-text-secondary px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                  Danh mục
                </th>
                <th className="text-text-secondary px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                  Trạng thái
                </th>
                <th className="text-text-secondary px-4 py-3 text-right text-xs font-medium tracking-wider uppercase">
                  Doanh thu
                </th>
                <th className="text-text-secondary px-4 py-3 text-right text-xs font-medium tracking-wider uppercase">
                  Vé bán
                </th>
                <th className="text-text-secondary px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                  Ngày tạo
                </th>
              </tr>
            </thead>
            <tbody className="divide-border-default divide-y">
              {events.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-text-secondary px-4 py-8 text-center"
                  >
                    Người dùng chưa tạo sự kiện nào
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr
                    key={event.id}
                    className="hover:bg-background-secondary cursor-pointer"
                    onClick={() => navigate(`/admin/events/${event.id}`)}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {event.bannerImageUrl && (
                          <img
                            src={event.bannerImageUrl}
                            alt={event.name}
                            className="h-12 w-16 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="text-text-primary text-sm font-medium">
                            {event.name}
                          </p>
                          {event.startDate && (
                            <p className="text-text-secondary flex items-center gap-1 text-xs">
                              <Calendar className="h-3 w-3" />
                              {new Date(event.startDate).toLocaleDateString(
                                'vi-VN'
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-text-primary px-4 py-4 text-sm">
                      {event.category?.name || '-'}
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(event.status)}
                    </td>
                    <td className="text-text-primary px-4 py-4 text-right font-semibold">
                      {((event.revenue || 0) / 1000000).toFixed(1)}M ₫
                    </td>
                    <td className="text-text-primary px-4 py-4 text-right font-semibold">
                      {event.ticketsSold || 0}
                    </td>
                    <td className="text-text-secondary px-4 py-4 text-sm">
                      {new Date(event.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="border-border-default flex items-center justify-between border-t px-6 py-4">
            <div className="text-text-secondary text-sm">
              Trang {pagination.currentPage} / {pagination.totalPages} - Tổng{' '}
              {pagination.totalEvents} sự kiện
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={page === pagination.totalPages}
                variant="outline"
                size="sm"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserEventsTab;
