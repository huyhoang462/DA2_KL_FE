import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  MapPin,
  User,
  Tag,
  Users,
  Ticket,
  Check,
  X,
  Clock,
  Building,
  DollarSign,
  Info,
  CheckCircle,
} from 'lucide-react';
import Button from '../../ui/Button';
import Modal from '../../ui/Modal';
import LoadingSpinner from '../../ui/LoadingSpinner';
import ConfirmModal from '../../ui/ConfirmModal';
import {
  getEventById,
  updateEventStatus,
} from '../../../services/adminService';

// Helper function để format location
const formatLocation = (location) => {
  if (typeof location === 'string') {
    return location;
  }

  if (typeof location === 'object' && location) {
    const parts = [
      location.address,
      location.street,
      location.ward,
      location.province,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : 'Chưa có địa chỉ';
  }

  return 'Chưa có địa chỉ';
};

const EventReviewModal = ({ isOpen, onClose, eventId }) => {
  const queryClient = useQueryClient();
  const [confirmAction, setConfirmAction] = useState(null);

  const {
    data: event,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['eventDetails', eventId],
    queryFn: () => getEventById(eventId),
    enabled: isOpen && !!eventId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ eventId, status }) => updateEventStatus(eventId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingEvents']);
      onClose();
      setConfirmAction(null);
    },
    onError: (error) => {
      console.error('Update status failed:', error);
    },
  });

  const handleStatusAction = (action) => {
    setConfirmAction(action);
  };

  const handleConfirmAction = () => {
    const status = confirmAction === 'approve' ? 'upcoming' : 'rejected';
    updateStatusMutation.mutate({ eventId, status });
  };

  if (isLoading) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Đang tải thông tin sự kiện..."
        maxWidth="max-w-4xl"
      >
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Không thể tải thông tin"
        maxWidth="max-w-md"
      >
        <div className="py-8 text-center">
          <div className="bg-destructive/10 text-destructive mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <X className="h-6 w-6" />
          </div>
          <p className="text-text-primary font-medium">
            Không thể tải thông tin sự kiện
          </p>
          <p className="text-text-secondary mt-2 text-sm">{error.message}</p>
          <Button onClick={onClose} className="mt-4" variant="outline">
            Đóng
          </Button>
        </div>
      </Modal>
    );
  }

  if (!event) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary rounded-lg p-2">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Duyệt sự kiện</h3>
              <p className="text-text-secondary text-sm">
                Xem xét và phê duyệt sự kiện
              </p>
            </div>
          </div>
        }
        maxWidth="max-w-4xl"
        xButton={true}
      >
        <div className="max-h-[80vh] overflow-y-auto">
          <div className="space-y-6">
            {/* 1. Event Header với Image & Basic Info */}
            <div className="from-primary/5 to-primary/10 rounded-xl bg-gradient-to-r p-6">
              <div className="space-y-4">
                {/* Event Image */}
                <div className="flex justify-center">
                  <img
                    src={event.bannerImageUrl}
                    alt={event.name}
                    className="h-48 w-full max-w-xl rounded-lg object-cover shadow-md"
                  />
                </div>

                {/* Event Title & Meta */}
                <div className="space-y-3 text-center">
                  <h3 className="text-text-primary text-2xl font-bold">
                    {event.name}
                  </h3>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <div className="bg-background-secondary flex items-center gap-1.5 rounded-full px-3 py-1.5">
                      <Tag className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {event.category?.name}
                      </span>
                    </div>
                    <div className="bg-background-secondary flex items-center gap-1.5 rounded-full px-3 py-1.5">
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {event.creator?.name}
                      </span>
                    </div>
                    <div className="bg-background-secondary flex items-center gap-1.5 rounded-full px-3 py-1.5">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Tạo:{' '}
                        {new Date(event.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Thông tin cơ bản sự kiện */}
            <div className="bg-background-secondary border-border-default rounded-lg border p-5">
              <h4 className="text-text-primary mb-4 flex items-center gap-2 text-lg font-semibold">
                <Info className="text-primary h-5 w-5" />
                Thông tin sự kiện
              </h4>

              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Định dạng:</span>
                    <span className="text-text-primary font-medium capitalize">
                      {event.format}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Trạng thái:</span>
                    <span className="bg-warning/10 text-warning rounded-full px-2 py-0.5 text-xs font-medium uppercase">
                      {event.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Bắt đầu:</span>
                    <span className="text-text-primary font-medium">
                      {new Date(event.startDate).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Kết thúc:</span>
                    <span className="text-text-primary font-medium">
                      {new Date(event.endDate).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-border-default mt-4 border-t pt-4">
                <div className="flex items-start gap-2">
                  <MapPin className="text-text-secondary mt-0.5 h-4 w-4 flex-shrink-0" />
                  <div>
                    <span className="text-text-secondary text-sm">
                      Địa điểm:{' '}
                    </span>
                    {event.format === 'offline' ? (
                      <span className="text-text-primary font-medium">
                        {event.location?.address ||
                          event.location?.province?.name ||
                          formatLocation(event.location)}
                      </span>
                    ) : (
                      <span className="text-text-primary font-medium">
                        Sự kiện trực tuyến
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Mô tả sự kiện */}
            <div className="bg-background-secondary border-border-default rounded-lg border p-5">
              <h4 className="text-text-primary mb-4 flex items-center gap-2 text-lg font-semibold">
                <Info className="text-primary h-5 w-5" />
                Mô tả sự kiện
              </h4>

              <div className="text-text-secondary max-h-60 overflow-y-auto text-sm leading-relaxed">
                {event.description ? (
                  <div
                    className="prose prose-sm prose-invert tiptap-content max-w-none"
                    dangerouslySetInnerHTML={{ __html: event.description }}
                  />
                ) : (
                  <p className="py-8 text-center italic">
                    Chưa có mô tả sự kiện
                  </p>
                )}
              </div>
            </div>

            {/* 4. Thông tin ban tổ chức */}
            <div className="bg-background-secondary border-border-default rounded-lg border p-5">
              <h4 className="text-text-primary mb-4 flex items-center gap-2 text-lg font-semibold">
                <Building className="text-primary h-5 w-5" />
                Thông tin ban tổ chức
              </h4>

              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div className="flex gap-2 md:col-span-2">
                    <span className="text-text-secondary">Tên tổ chức:</span>
                    <span className="text-text-primary font-medium">
                      {event.organizer?.name || 'Chưa cập nhật'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-text-secondary">Email:</span>
                    <span className="text-text-primary font-medium">
                      {event.organizer?.email || 'Chưa cập nhật'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-text-secondary">Điện thoại:</span>
                    <span className="text-text-primary font-medium">
                      {event.organizer?.phone || 'Chưa cập nhật'}
                    </span>
                  </div>
                </div>

                {event.organizer?.description && (
                  <div className="border-border-default mt-3 border-t pt-3">
                    <div className="flex flex-col gap-2">
                      <span className="text-text-secondary">
                        Mô tả ban tổ chức:
                      </span>
                      <span className="text-text-primary bg-background-primary rounded-lg p-3 text-sm leading-relaxed">
                        {event.organizer.description}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 5. Thông tin show và vé */}
            <div className="bg-background-secondary border-border-default rounded-lg border p-5">
              <div className="mb-4 flex items-center gap-2">
                <Ticket className="text-primary h-5 w-5" />
                <h4 className="text-text-primary text-lg font-semibold">
                  Thông tin show & vé
                </h4>
                {event.shows && event.shows.length > 0 && (
                  <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                    {event.shows.length} show
                  </span>
                )}
              </div>

              {event.shows && event.shows.length > 0 ? (
                <div className="space-y-4">
                  {event.shows.map((show) => (
                    <div
                      key={show._id || show.id}
                      className="bg-background-primary border-border-default rounded-lg p-4"
                    >
                      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h5 className="text-text-primary text-lg font-semibold">
                          {show.name}
                        </h5>
                        <span className="text-text-secondary bg-background-secondary rounded-full px-3 py-1 text-xs">
                          {new Date(show.startTime).toLocaleString('vi-VN')}
                        </span>
                      </div>

                      {show.tickets && show.tickets.length > 0 ? (
                        <div className="space-y-3">
                          <h6 className="text-text-primary mb-2 text-sm font-medium">
                            Danh sách vé ({show.tickets.length} loại):
                          </h6>
                          {show.tickets.map((ticket) => (
                            <div
                              key={ticket._id || ticket.id}
                              className="bg-background-secondary border-border-subtle rounded-lg border p-3"
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex-1">
                                  <h6 className="text-text-primary font-medium">
                                    {ticket.name}
                                  </h6>
                                  {ticket.description && (
                                    <p className="text-text-secondary mt-1 text-xs">
                                      {ticket.description}
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center gap-4 text-sm">
                                  <div className="text-primary flex items-center gap-1 font-semibold">
                                    <span>
                                      {ticket.price.toLocaleString('vi-VN')} VNĐ
                                    </span>
                                  </div>
                                  <div className="text-text-primary bg-background-primary flex items-center gap-1 rounded-full px-2 py-1">
                                    <Ticket className="h-3 w-3" />
                                    <span>{ticket.quantityTotal} vé</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-background-secondary rounded-lg p-4 text-center">
                          <Ticket className="text-text-secondary mx-auto mb-2 h-8 w-8" />
                          <p className="text-text-secondary text-sm italic">
                            Show này chưa có thông tin vé
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-background-primary rounded-lg p-8 text-center">
                  <Ticket className="text-text-secondary mx-auto mb-3 h-12 w-12" />
                  <h5 className="text-text-primary mb-1 font-medium">
                    Chưa có thông tin show
                  </h5>
                  <p className="text-text-secondary text-sm">
                    Sự kiện này chưa có show và vé nào được tạo
                  </p>
                </div>
              )}
            </div>

            {/* 6. Action Buttons - Sticky bottom */}
            <div className="border-border-default bg-background-secondary sticky bottom-0 rounded-lg border p-4 shadow-lg">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-text-secondary">
                  <p className="font-medium">
                    🔍 Sự kiện này đang chờ phê duyệt
                  </p>
                  <p className="text-xs">
                    Hãy xem xét kỹ lưỡng trước khi đưa ra quyết định
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleStatusAction('reject')}
                    variant="destructive"
                    size="lg"
                    className="flex flex-1 items-center gap-2 sm:flex-none"
                    disabled={updateStatusMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                    Từ chối
                  </Button>
                  <Button
                    onClick={() => handleStatusAction('approve')}
                    size="lg"
                    className="flex flex-1 items-center gap-2 sm:flex-none"
                    disabled={updateStatusMutation.isPending}
                  >
                    <Check className="h-4 w-4" />
                    Phê duyệt
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={!!confirmAction}
        icon={
          confirmAction === 'approve' && (
            <div className="bg-success/30 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
              <CheckCircle
                className="text-success h-6 w-6"
                aria-hidden="true"
              />
            </div>
          )
        }
        title={
          confirmAction === 'approve'
            ? 'Xác nhận phê duyệt'
            : 'Xác nhận từ chối'
        }
        message={
          <div className="space-y-3">
            <div className="text-center">
              Bạn có chắc chắn muốn{' '}
              <strong>
                {confirmAction === 'approve' ? 'phê duyệt' : 'từ chối'}
              </strong>{' '}
              sự kiện này?
            </div>

            <p className="text-text-secondary text-center text-sm">
              {confirmAction === 'approve'
                ? 'Sự kiện sẽ được công khai và người dùng có thể mua vé'
                : 'Sự kiện sẽ bị từ chối và người tổ chức sẽ nhận được thông báo'}
            </p>
          </div>
        }
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmAction(null)}
        confirmText={confirmAction === 'approve' ? 'Phê duyệt' : 'Từ chối'}
        confirmVariant={confirmAction === 'approve' ? 'success' : 'destructive'}
        isLoading={updateStatusMutation.isPending}
      />
    </>
  );
};

export default EventReviewModal;
