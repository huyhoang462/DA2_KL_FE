import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { getPendingEvents } from '../../services/adminService';

import EventListItem from '../../components/features/admin/EventListItem';
import EventReviewModal from '../../components/features/admin/EventReviewModal';

const AdminEventApprovalsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewingEventId, setReviewingEventId] = useState(null);
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['pendingEvents', currentPage],
    queryFn: () => getPendingEvents({ page: currentPage, limit }),
    placeholderData: (prev) => prev,
  });

  // ✅ Cập nhật theo cấu trúc response mới từ BE
  const events = data?.data || [];
  const pagination = data?.pagination || {};
  const totalPages = pagination.totalPages || 1;
  const totalCount = pagination.totalItems || 0;
  const hasNextPage = pagination.hasNextPage || false;
  const hasPreviousPage = pagination.hasPreviousPage || false;

  const handleViewDetails = (eventId) => {
    setReviewingEventId(eventId);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-text-primary text-3xl font-bold">Duyệt sự kiện</h1>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="bg-background-secondary border-border-default rounded-lg border p-12 text-center">
            <h3 className="text-text-primary text-lg font-semibold">
              Lỗi tải dữ liệu
            </h3>
            <p className="text-text-secondary mt-1 text-sm">{error.message}</p>
          </div>
        ) : events.length > 0 ? (
          events.map((event) => (
            <EventListItem
              key={event.id}
              event={event}
              onViewDetails={handleViewDetails}
            />
          ))
        ) : (
          <div className="bg-background-secondary border-border-default rounded-lg border p-12 text-center">
            <h3 className="text-text-primary text-lg font-semibold">
              Không có sự kiện chờ duyệt
            </h3>
            <p className="text-text-secondary mt-1 text-sm">
              Tất cả sự kiện đã được xử lý.
            </p>
          </div>
        )}
      </div>

      {/* Pagination - Cập nhật logic */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-text-secondary text-sm">
            <span>
              Trang {pagination.currentPage || currentPage} trên {totalPages}
            </span>
            <span className="ml-4">
              Hiển thị {events.length} trên {totalCount} sự kiện
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPreviousPage} // ✅ Dùng hasPreviousPage thay vì currentPage === 1
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
              Trước
            </Button>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNextPage}
              variant="outline"
              size="sm"
            >
              Sau
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <EventReviewModal
        isOpen={!!reviewingEventId}
        onClose={() => setReviewingEventId(null)}
        eventId={reviewingEventId}
      />
    </div>
  );
};

export default AdminEventApprovalsPage;
