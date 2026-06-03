import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  Calendar,
  Clock3,
  CheckCircle2,
} from 'lucide-react';
import AdminSummaryCard from '../../components/features/admin/AdminSummaryCard';
import Button from '../../components/ui/Button';
import ErrorDisplay from '../../components/ui/ErrorDisplay';
import ConfirmModal from '../../components/ui/ConfirmModal';
import EventReviewModal from '../../components/features/admin/EventReviewModal';
import EventRow from '../../components/features/admin/EventRow';
import {
  getAllEvents,
  toggleEventFeatured,
  deleteEvent,
} from '../../services/adminService';

const AdminEventsPageSkeleton = () => (
  <div className="space-y-6">
    <div className="bg-background-secondary border-border-default overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background-primary border-border-default border-b">
            <tr>
              <th className="px-6 py-3 text-left">
                <div className="bg-background-secondary h-4 w-24 animate-pulse rounded" />
              </th>
              <th className="px-6 py-3 text-left">
                <div className="bg-background-secondary h-4 w-20 animate-pulse rounded" />
              </th>
              <th className="px-6 py-3 text-left">
                <div className="bg-background-secondary h-4 w-24 animate-pulse rounded" />
              </th>
              <th className="px-6 py-3 text-left">
                <div className="bg-background-secondary h-4 w-20 animate-pulse rounded" />
              </th>
              <th className="px-6 py-3 text-left">
                <div className="bg-background-secondary h-4 w-20 animate-pulse rounded" />
              </th>
              <th className="px-6 py-3 text-right">
                <div className="bg-background-secondary ml-auto h-4 w-24 animate-pulse rounded" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-border-default divide-y">
            {[...Array(10)].map((_, index) => (
              <tr key={index} className="animate-pulse">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-background-primary h-16 w-24 rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="bg-background-primary h-4 w-48 rounded" />
                      <div className="bg-background-primary h-3 w-32 rounded" />
                      <div className="bg-background-primary h-3 w-40 rounded" />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="bg-background-primary h-6 w-20 rounded-full" />
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="bg-background-primary h-4 w-16 rounded" />
                    <div className="bg-background-primary h-3 w-24 rounded" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="bg-background-primary h-4 w-20 rounded" />
                    <div className="bg-background-primary h-3 w-16 rounded" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="bg-background-primary h-4 w-24 rounded" />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <div className="bg-background-primary h-8 w-8 rounded" />
                    <div className="bg-background-primary h-8 w-8 rounded" />
                    <div className="bg-background-primary h-8 w-8 rounded" />
                    <div className="bg-background-primary h-8 w-8 rounded" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <div className="flex items-center justify-between">
      <div className="bg-background-secondary h-4 w-48 animate-pulse rounded" />
      <div className="flex items-center gap-2">
        <div className="bg-background-secondary h-9 w-20 animate-pulse rounded" />
        <div className="bg-background-secondary h-9 w-20 animate-pulse rounded" />
      </div>
    </div>
  </div>
);

const AdminEventsPage = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    status: searchParams.get('status') || '',
    format: '',
    isFeatured: null,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [searchInput, setSearchInput] = useState('');

  // Modal states
  const [reviewModalState, setReviewModalState] = useState({
    isOpen: false,
    eventId: null,
  });
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    event: null,
  });
  const [featuredModalState, setFeaturedModalState] = useState({
    isOpen: false,
    event: null,
  });

  const limit = 20;

  // Handle eventId from URL query params
  useEffect(() => {
    const eventId = searchParams.get('eventId');
    const status = searchParams.get('status');

    if (eventId) {
      setReviewModalState({ isOpen: true, eventId });
    }

    if (status) {
      setFilters((prev) => ({ ...prev, status }));
    }
  }, [searchParams]);

  // Fetch events
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['adminEvents', currentPage, filters],
    queryFn: () => getAllEvents({ ...filters, page: currentPage, limit }),
    placeholderData: (prev) => prev,
  });

  const events = data?.data?.events || [];
  const pagination = data?.data?.pagination || {};
  const overview = data?.data?.overview || {};

  // Calculate stats from events
  const stats = {
    total: overview.total ?? pagination.totalEvents ?? 0,
    pending: overview.pending ?? 0,
    completed: overview.completed ?? 0,
    featured: overview.featured ?? 0,
  };

  const summaryCards = [
    {
      key: 'total',
      title: 'Tổng sự kiện',
      value: stats.total,
      icon: Calendar,
      color: 'primary',
      active: !filters.status && filters.isFeatured === null,
      onClick: () =>
        setFilters((prev) => ({
          ...prev,
          status: '',
          isFeatured: null,
        })),
    },
    {
      key: 'pending',
      title: 'Chờ duyệt',
      value: stats.pending,
      icon: Clock3,
      color: 'warning',
      active: filters.status === 'pending',
      onClick: () =>
        setFilters((prev) => ({
          ...prev,
          status: 'pending',
          isFeatured: null,
        })),
    },
    {
      key: 'completed',
      title: 'Chờ tất toán',
      value: stats.completed,
      icon: CheckCircle2,
      color: 'success',
      active: filters.status === 'completed',
      onClick: () =>
        setFilters((prev) => ({
          ...prev,
          status: 'completed',
          isFeatured: null,
        })),
    },
    {
      key: 'featured',
      title: 'Nổi bật',
      value: stats.featured,
      icon: Star,
      color: 'info',
      active: filters.isFeatured === true,
      onClick: () =>
        setFilters((prev) => ({
          ...prev,
          status: '',
          isFeatured: true,
        })),
    },
  ];

  // Mutations
  const toggleFeaturedMutation = useMutation({
    mutationFn: ({ eventId, featured }) =>
      toggleEventFeatured(eventId, featured),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminEvents']);
      setFeaturedModalState({ isOpen: false, event: null });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: (eventId) => deleteEvent(eventId, false),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminEvents']);
      setDeleteModalState({ isOpen: false, event: null });
    },
  });

  // Handlers
  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchInput }));
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewDetails = useCallback((eventId) => {
    setReviewModalState({ isOpen: true, eventId });
  }, []);

  const handleCloseReviewModal = useCallback(() => {
    setReviewModalState({ isOpen: false, eventId: null });
    // Remove eventId from URL if it exists
    if (searchParams.get('eventId')) {
      searchParams.delete('eventId');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const handleToggleFeatured = useCallback((event) => {
    setFeaturedModalState({ isOpen: true, event });
  }, []);

  const handleConfirmToggleFeatured = () => {
    const event = featuredModalState.event;
    if (event) {
      toggleFeaturedMutation.mutate({
        eventId: event.id,
        featured: !event.featured,
      });
    }
  };

  const handleDeleteEvent = useCallback((event) => {
    setDeleteModalState({ isOpen: true, event });
  }, []);

  const handleSettleEvent = useCallback((event) => {
    console.log('Tất toán sự kiện:', event);
  }, []);

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-text-primary text-3xl font-bold">
          Quản lý sự kiện
        </h1>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {/* Search */}
        <form onSubmit={handleSearch} className="md:col-span-3">
          <div className="relative">
            <Search className="text-text-secondary absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo tên sự kiện hoặc organizer..."
              className="bg-background-secondary border-border-default text-text-primary placeholder:text-text-secondary focus:border-primary focus:ring-primary w-full rounded-lg border py-2 pr-4 pl-10 text-sm focus:ring-1 focus:outline-none"
            />
          </div>
        </form>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="bg-background-secondary border-border-default text-text-primary focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ duyệt</option>
          <option value="approved">Đã duyệt</option>
          <option value="upcoming">Sắp diễn ra</option>
          <option value="ongoing">Đang diễn ra</option>
          <option value="rejected">Từ chối</option>
          <option value="cancelled">Đã hủy</option>
          <option value="completed">Chờ tất toán</option>
          <option value="settled">Đã tất toán</option>
        </select>

        {/* Format Filter */}
        <select
          value={filters.format}
          onChange={(e) => handleFilterChange('format', e.target.value)}
          className="bg-background-secondary border-border-default text-text-primary focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
        >
          <option value="">Tất cả định dạng</option>
          <option value="offline">Offline</option>
          <option value="online">Online</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {summaryCards.map((card) => (
          <AdminSummaryCard
            key={card.key}
            title={card.title}
            value={Number(card.value || 0).toLocaleString('vi-VN')}
            icon={card.icon}
            color={card.color}
            onClick={card.onClick}
            disabled={isFetching}
            active={card.active}
          />
        ))}
      </div>

      {/* Events Table */}
      {isLoading || isFetching ? (
        <AdminEventsPageSkeleton />
      ) : (
        <div className="bg-background-secondary border-border-default overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background-primary border-border-default border-b">
                <tr>
                  <th className="text-text-secondary py-3 pr-4 pl-5 text-left text-xs font-medium tracking-wider uppercase">
                    Sự kiện
                  </th>
                  <th className="text-text-secondary px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                    Trạng thái
                  </th>
                  <th className="text-text-secondary px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                    Organizer
                  </th>
                  <th className="text-text-secondary px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                    Vé bán
                  </th>
                  <th className="text-text-secondary px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                    Ngày tạo
                  </th>
                  <th className="text-text-secondary py-3 pr-5 pl-4 text-right text-xs font-medium tracking-wider uppercase">
                    Hành động
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
                      Không tìm thấy sự kiện nào
                    </td>
                  </tr>
                ) : (
                  events.map((event) => (
                    <EventRow
                      key={event.id}
                      event={event}
                      onViewDetails={handleViewDetails}
                      onToggleFeatured={handleToggleFeatured}
                      onDelete={handleDeleteEvent}
                      onSettle={handleSettleEvent}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-text-secondary text-sm">
            Tổng {pagination.totalEvents} sự kiện
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handlePageChange(currentPage - 1);
              }}
              disabled={currentPage === 1}
              variant="secondary"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page Numbers */}
            {(() => {
              const pages = [];
              const totalPages = pagination.totalPages;
              const current = currentPage;

              // Always show first page
              pages.push(1);

              // Show pages around current page
              if (current > 3) pages.push('...');

              for (
                let i = Math.max(2, current - 1);
                i <= Math.min(totalPages - 1, current + 1);
                i++
              ) {
                pages.push(i);
              }

              // Always show last page
              if (current < totalPages - 2) pages.push('...');
              if (totalPages > 1) pages.push(totalPages);

              return pages.map((page, idx) => {
                if (page === '...') {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="text-text-secondary px-2"
                    >
                      ...
                    </span>
                  );
                }

                return (
                  <Button
                    key={page}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePageChange(page);
                    }}
                    variant={currentPage === page ? 'primary' : 'outline'}
                    size="sm"
                    className="min-w-[2.5rem]"
                  >
                    {page}
                  </Button>
                );
              });
            })()}

            <Button
              onClick={(e) => {
                e.stopPropagation();
                handlePageChange(currentPage + 1);
              }}
              disabled={currentPage === pagination.totalPages}
              variant="secondary"
              size="sm"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <EventReviewModal
        isOpen={reviewModalState.isOpen}
        onClose={handleCloseReviewModal}
        eventId={reviewModalState.eventId}
      />

      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        title="Hủy sự kiện"
        message={
          <div>
            Bạn có chắc chắn muốn hủy sự kiện{' '}
            <strong>{deleteModalState.event?.name}</strong>?
            <br />
            {/* <span className="text-text-secondary text-sm">
              Sự kiện sẽ bị soft delete. Dữ liệu vẫn được giữ lại.
            </span> */}
          </div>
        }
        onConfirm={() => deleteEventMutation.mutate(deleteModalState.event.id)}
        onCancel={() => setDeleteModalState({ isOpen: false, event: null })}
        confirmText="Xác nhận"
        cancelText="Không"
        confirmVariant="destructive"
        isLoading={deleteEventMutation.isPending}
      />

      <ConfirmModal
        isOpen={featuredModalState.isOpen}
        title={
          featuredModalState.event?.featured ? 'Bỏ Nổi bật' : 'Đánh dấu Nổi bật'
        }
        icon={
          <div
            className={`${featuredModalState.event?.featured ? 'bg-warning/10' : 'bg-primary/10'} mx-auto flex h-14 w-14 items-center justify-center rounded-full`}
          >
            <Star
              className={`${featuredModalState.event?.featured ? 'text-warning' : 'text-primary'} h-7 w-7 ${featuredModalState.event?.featured ? '' : 'fill-primary'}`}
              aria-hidden="true"
            />
          </div>
        }
        message={
          <div>
            Bạn có chắc chắn muốn{' '}
            <strong
              className={
                featuredModalState.event?.featured
                  ? 'text-warning'
                  : 'text-primary'
              }
            >
              {featuredModalState.event?.featured
                ? 'bỏ đánh dấu nổi bật'
                : 'đánh dấu nổi bật'}
            </strong>{' '}
            cho sự kiện <strong>{featuredModalState.event?.name}</strong>?
          </div>
        }
        onConfirm={handleConfirmToggleFeatured}
        onCancel={() => setFeaturedModalState({ isOpen: false, event: null })}
        confirmText={
          featuredModalState.event?.featured ? 'Bỏ Nổi bật' : 'Đánh dấu Nổi bật'
        }
        confirmVariant={
          featuredModalState.event?.featured ? 'warning' : 'primary'
        }
        isLoading={toggleFeaturedMutation.isPending}
      />
    </div>
  );
};

export default AdminEventsPage;
