// src/pages/user/EventDetailPage.jsx
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
    <div className="bg-background-primary min-h-screen pt-6 pb-20">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        {/* 1. Phần Hero Ticket full width phía trên */}
        <BigTicket event={event} />

        {/* 2. Cấu trúc 2 cột cho phần Content & Ticket Selection */}
        <div className="mt-8 flex flex-col items-start gap-8 lg:flex-row lg:gap-10">
          {/* Cột Trái: Thông tin chi tiết */}
          <div className="flex w-full min-w-0 flex-1 flex-col space-y-8">
            <EventDescription description={event.description} />
            <EventOrganizerInfo organizer={event.organizer} />
          </div>

          {/* Cột Phải: Suất diễn & Mua vé (Sticky) */}
          <div className="w-full flex-shrink-0 lg:sticky lg:top-24 lg:w-[400px] xl:w-[420px]">
            <div className="border-border-default bg-background-secondary rounded-2xl border p-5 shadow-sm">
              <h2 className="text-text-primary mb-5 text-xl font-bold">
                Chọn vé của bạn
              </h2>
              <ShowtimeList
                shows={event.shows}
                eventId={event._id || event.id}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
