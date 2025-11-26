// src/pages/dashboard/check-in-staff/partials/AssignEventsModal.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import { userService } from '../../../services/userService';
import { getEventsByUserId } from '../../../services/eventService';
import { Check } from 'lucide-react';
import { useSelector } from 'react-redux';

const CheckboxItem = ({ label, id, checked, onToggle }) => <></>;

export default function AssignEventsModal({ isOpen, onClose, staffMember }) {
  const queryClient = useQueryClient();
  const userId = useSelector((state) => state.auth.user?.id);
  const [selectedEventIds, setSelectedEventIds] = useState(
    staffMember?.assignedEvents || []
  );

  const { data: allMyEvents = [], isLoading: isLoadingEvents } = useQuery({
    queryKey: ['myEventsForAssignment'],
    queryFn: () => getEventsByUserId(userId),
  });

  const assignMutation = useMutation({
    mutationFn: (eventIds) =>
      userService.assignEventsToStaff(staffMember.id, eventIds),
    onSuccess: () => {
      // toast.success("Phân quyền thành công!");
      queryClient.invalidateQueries(['myStaff']); // Fetch lại danh sách staff để cập nhật số lượng
      onClose();
    },
    onError: (err) => {
      // toast.error(err.message || "Phân quyền thất bại.");
    },
  });

  const handleToggleEvent = (eventId) => {
    setSelectedEventIds((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleSave = () => {
    assignMutation.mutate(selectedEventIds);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Phân quyền cho ${staffMember?.fullName}`}
    >
      <div className="p-6">
        <p className="text-text-secondary mb-4 text-sm">
          Chọn các sự kiện mà tài khoản này được phép thực hiện check-in.
        </p>
        {isLoadingEvents ? (
          <p>Đang tải danh sách sự kiện...</p>
        ) : (
          <div className="max-h-80 space-y-3 overflow-y-auto pr-2">
            {allMyEvents.map((event) => (
              <CheckboxItem
                key={event.id}
                label={event.name}
                checked={selectedEventIds.includes(event.id)}
                onToggle={() => handleToggleEvent(event.id)}
              />
            ))}
          </div>
        )}
      </div>
      <div className="border-border-default bg-background-primary flex items-center justify-end gap-4 border-t p-4">
        <Button type="button" variant="ghost" onClick={onClose}>
          Hủy
        </Button>
        <Button onClick={handleSave} disabled={assignMutation.isPending}>
          {assignMutation.isPending ? 'Đang lưu...' : 'Lưu phân quyền'}
        </Button>
      </div>
    </Modal>
  );
}
