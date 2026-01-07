import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import {
  getStaffEvents,
  assignMultipleEvents,
  removeMultipleEvents,
} from '../../../services/staffPermissionService';
import { Calendar, PlayCircle, CheckCircle, MapPin } from 'lucide-react';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { formatDate } from '../../../utils/formatDate';

const CheckboxItem = ({ event, checked, onToggle }) => {
  return (
    <label className="border-border-default hover:bg-background-primary group flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-all hover:shadow-md">
      <div className="flex h-5 items-center pt-1">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="border-border-default text-primary focus:ring-primary h-5 w-5 cursor-pointer rounded border-2"
        />
      </div>

      {/* Event Image */}
      {event.bannerImageUrl && (
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
          <img
            src={event.bannerImageUrl}
            alt={event.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Event Info */}
      <div className="min-w-0 flex-1">
        <div className="text-text-primary group-hover:text-primary mb-2 text-base font-semibold transition-colors">
          {event.name}
        </div>

        <div className="space-y-1.5">
          {event.startDate && (
            <div className="text-text-secondary flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>{formatDate(event.startDate, 'DD/MM/YYYY')}</span>
            </div>
          )}

          {event.location && (
            <div className="text-text-secondary flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {event.format === 'offline'
                  ? event.location.address ||
                    event.location.province?.name ||
                    'Chưa cập nhật'
                  : 'Sự kiện online'}
              </span>
            </div>
          )}
        </div>

        {/* Event Stats */}
        {(event.totalTicketsSold !== undefined ||
          event.totalTicketsAvailable !== undefined) && (
          <div className="mt-3 flex items-center gap-4">
            <div>
              <span className="text-text-secondary text-xs">Vé đã bán: </span>
              <span className="text-text-primary text-sm font-semibold">
                {event.totalTicketsSold || 0} /{' '}
                {event.totalTicketsAvailable || 0}
              </span>
            </div>
          </div>
        )}
      </div>
    </label>
  );
};

const EventListItem = ({ event, icon: Icon }) => {
  return (
    <div className="border-border-default bg-background-secondary flex items-start gap-4 rounded-lg border p-4">
      {/* Event Image */}
      {event.bannerImageUrl && (
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
          <img
            src={event.bannerImageUrl}
            alt={event.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Event Info */}
      <div className="min-w-0 flex-1">
        <div className="text-text-primary mb-2 text-base font-semibold">
          {event.name}
        </div>

        <div className="space-y-1.5">
          {event.startDate && (
            <div className="text-text-secondary flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>{formatDate(event.startDate, 'DD/MM/YYYY')}</span>
            </div>
          )}

          {event.location && (
            <div className="text-text-secondary flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {event.format === 'offline'
                  ? event.location.address ||
                    event.location.province?.name ||
                    'Chưa cập nhật'
                  : 'Sự kiện online'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Status Icon */}
      <div className="bg-primary/10 flex-shrink-0 rounded-lg p-3">
        <Icon className="text-primary h-5 w-5" />
      </div>
    </div>
  );
};

export default function AssignEventsModal({
  isOpen,
  onClose,
  staffMember,
  allEvents = [],
  isLoadingEvents = false,
}) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedEventIds, setSelectedEventIds] = useState([]);
  const [initialEventIds, setInitialEventIds] = useState([]);

  // Fetch staff's assigned events
  const { data: staffEventsData, isLoading: isLoadingStaffEvents } = useQuery({
    queryKey: ['staffEvents', staffMember?.id],
    queryFn: () => getStaffEvents(staffMember.id),
    enabled: !!staffMember?.id && isOpen,
  });

  // Initialize selected events when staff events are loaded
  useEffect(() => {
    if (staffEventsData?.events) {
      const assignedIds = staffEventsData.events;
      setSelectedEventIds(assignedIds);
      setInitialEventIds(assignedIds);
    }
  }, [staffEventsData]);

  // Categorize events by status
  const { upcomingEvents, ongoingEvents, completedEvents } = useMemo(() => {
    if (!allEvents)
      return { upcomingEvents: [], ongoingEvents: [], completedEvents: [] };

    const upcoming = [];
    const ongoing = [];
    const completed = [];

    allEvents.forEach((event) => {
      if (event.status === 'upcoming') {
        upcoming.push(event);
      } else if (event.status === 'ongoing') {
        ongoing.push(event);
      } else if (event.status === 'completed') {
        completed.push(event);
      }
    });

    return {
      upcomingEvents: upcoming.sort(
        (a, b) => new Date(a.startDate) - new Date(b.startDate)
      ),
      ongoingEvents: ongoing.sort(
        (a, b) => new Date(a.startDate) - new Date(b.startDate)
      ),
      completedEvents: completed.sort(
        (a, b) => new Date(b.startDate) - new Date(a.startDate)
      ),
    };
  }, [allEvents]);

  // Filter assigned events by category
  const assignedUpcoming = upcomingEvents.filter((e) =>
    initialEventIds.includes(e.id)
  );
  const assignedOngoing = ongoingEvents.filter((e) =>
    initialEventIds.includes(e.id)
  );
  const assignedCompleted = completedEvents.filter((e) =>
    initialEventIds.includes(e.id)
  );

  const assignMutation = useMutation({
    mutationFn: ({ staffId, eventIds }) =>
      assignMultipleEvents(staffId, eventIds),
    onSuccess: () => {
      queryClient.invalidateQueries(['myStaff']);
      queryClient.invalidateQueries(['staffEvents', staffMember.id]);
    },
  });

  const removeMutation = useMutation({
    mutationFn: ({ staffId, eventIds }) =>
      removeMultipleEvents(staffId, eventIds),
    onSuccess: () => {
      queryClient.invalidateQueries(['myStaff']);
      queryClient.invalidateQueries(['staffEvents', staffMember.id]);
    },
  });

  const handleToggleEvent = (eventId) => {
    setSelectedEventIds((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleSave = async () => {
    try {
      // Find events to assign (newly checked)
      const toAssign = selectedEventIds.filter(
        (id) => !initialEventIds.includes(id)
      );
      // Find events to remove (unchecked)
      const toRemove = initialEventIds.filter(
        (id) => !selectedEventIds.includes(id)
      );

      // Execute mutations
      const promises = [];
      if (toAssign.length > 0) {
        promises.push(
          assignMutation.mutateAsync({
            staffId: staffMember.id,
            eventIds: toAssign,
          })
        );
      }
      if (toRemove.length > 0) {
        promises.push(
          removeMutation.mutateAsync({
            staffId: staffMember.id,
            eventIds: toRemove,
          })
        );
      }

      if (promises.length > 0) {
        await Promise.all(promises);
      }

      onClose();
    } catch (error) {
      console.error('Error updating staff permissions:', error);
    }
  };

  const isSaving = assignMutation.isPending || removeMutation.isPending;
  const isLoading = isLoadingEvents || isLoadingStaffEvents;

  const TABS = [
    {
      key: 'upcoming',
      label: 'Sắp diễn ra',
      icon: Calendar,
      count: assignedUpcoming.length,
    },
    {
      key: 'ongoing',
      label: 'Đang diễn ra',
      icon: PlayCircle,
      count: assignedOngoing.length,
    },
    {
      key: 'completed',
      label: 'Đã kết thúc',
      icon: CheckCircle,
      count: assignedCompleted.length,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Phân quyền cho ${staffMember?.fullName || 'nhân viên'}`}
      size="lg"
      maxWidth="max-w-6xl"
    >
      <div className="flex h-[80vh] flex-col">
        <div className="p-6 pb-4">
          <p className="text-text-secondary text-sm">
            Chọn các sự kiện sắp diễn ra mà tài khoản này được phép thực hiện
            check-in.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-border-default border-b px-6">
          <div className="flex gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'border-primary text-primary'
                      : 'text-text-secondary hover:text-text-primary border-transparent'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-semibold">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {activeTab === 'upcoming' && (
                <div className="space-y-3">
                  {upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event) => (
                      <CheckboxItem
                        key={event.id}
                        event={event}
                        checked={selectedEventIds.includes(event.id)}
                        onToggle={() => handleToggleEvent(event.id)}
                      />
                    ))
                  ) : (
                    <div className="text-text-secondary py-8 text-center text-sm">
                      Không có sự kiện sắp diễn ra
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'ongoing' && (
                <div className="space-y-3">
                  {ongoingEvents.length > 0 ? (
                    ongoingEvents.map((event) => (
                      <CheckboxItem
                        key={event.id}
                        event={event}
                        checked={selectedEventIds.includes(event.id)}
                        onToggle={() => handleToggleEvent(event.id)}
                      />
                    ))
                  ) : (
                    <div className="text-text-secondary py-8 text-center text-sm">
                      Không có sự kiện đang diễn ra
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'completed' && (
                <div className="space-y-3">
                  {assignedCompleted.length > 0 ? (
                    assignedCompleted.map((event) => (
                      <EventListItem
                        key={event.id}
                        event={event}
                        icon={CheckCircle}
                      />
                    ))
                  ) : (
                    <div className="text-text-secondary py-8 text-center text-sm">
                      Nhân viên chưa được phân quyền sự kiện nào đã kết thúc
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-border-default bg-background-primary flex items-center justify-end gap-3 border-t p-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSaving}
          >
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? 'Đang lưu...' : 'Cập nhật phân quyền'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
