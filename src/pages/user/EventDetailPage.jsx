import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getEventById } from '../../services/eventService';

import EventDescription from '../../components/features/event/EventDescription';
import EventOrganizerInfo from '../../components/features/event/EventOrganizerInfo';
import ErrorDisplay from '../../components/ui/ErrorDisplay';
import BigTicket from '../../components/features/event/BigTicket';
import ShowtimeList from '../../components/features/event/ShowtimeList';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function EventDetailPage() {
  const { id } = useParams();

  const {
    data: event,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['eventDetail', id],
    queryFn: () => getEventById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  if (isError) return <ErrorDisplay message={error.message} />;
  if (!event) return <ErrorDisplay message="Không tìm thấy sự kiện." />;

  return (
    <div className="bg-background-primary text-text-primary container mx-auto min-h-screen">
      <div className="mx-auto">
        <div className="mb-10 grid grid-cols-1 space-y-8">
          <BigTicket event={event} />
          <EventDescription description={event.description} />
          <EventOrganizerInfo organizer={event.organizer} />

          <div className="sticky top-20 space-y-6">
            <h2 className="text-xl font-bold">Chọn vé của bạn</h2>
            <ShowtimeList shows={event.shows} />
          </div>
        </div>
      </div>
    </div>
  );
}
