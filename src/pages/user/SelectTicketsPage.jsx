// src/pages/user/SelectTicketsPage.jsx
import React, { useEffect, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, Calendar, MapPin, Clock } from 'lucide-react';

import { getEventById } from '../../services/eventService';
import { startNewCart } from '../../store/slices/cartSlice';

import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorDisplay from '../../components/ui/ErrorDisplay';
import TicketShowGroup from '../../components/features/buyTicket/TicketShowGroup';
import CartSummary from '../../components/features/buyTicket/CartSummary';
import MobileCartSummary from '../../components/features/buyTicket/MobileCartSummary';
import { getTicketTypesByShowId } from '../../services/ticketService';

export default function SelectTicketsPage() {
  const { id: eventId, showId } = useParams(); // ✅ Get both eventId and showId
  const dispatch = useDispatch();

  const {
    data: event,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['eventForSelection', eventId],
    queryFn: () => getEventById(eventId),
    enabled: !!eventId,
  });

  const cartItems = useSelector((state) => state.cart.items);

  // ✅ Start cart with showId instead of eventId
  useEffect(() => {
    if (showId) {
      dispatch(startNewCart({ id: showId }));
    }
  }, [showId, dispatch]);

  const handleGetTicketInfo = async () => {
    try {
      await getTicketTypesByShowId(showId);
    } catch (error) {
      console.error('GETINFO error:', error);
    }
  };

  // ✅ Find the specific show by showId
  const selectedShow = useMemo(() => {
    if (!event?.shows || !showId) return null;
    return event.shows.find((show) => (show._id || show.id) === showId);
  }, [event, showId]);

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );

  if (isError) return <ErrorDisplay message={error.message} />;
  if (!event) return <ErrorDisplay message="Không tìm thấy sự kiện." />;

  // ✅ Redirect if show not found
  if (!selectedShow) {
    return <Navigate to={`/event-detail/${eventId}`} replace />;
  }

  const formattedDate = new Date(event.startDate).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // ✅ Format show specific date/time
  const showStartTime = new Date(selectedShow.startTime);
  const showEndTime = new Date(selectedShow.endTime);
  const showFormattedDate = showStartTime.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const showTimeRange = `${showStartTime.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })} - ${showEndTime.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;

  return (
    <div className="bg-background-primary text-text-primary min-h-[calc(100vh-64px)]">
      <div className="border-border-subtle bg-background-secondary mx-auto mb-4 rounded-xl border-b py-6">
        <div className="container mx-auto flex flex-col px-4">
          <div className="flex gap-4">
            <h1 className="text-text-primary text-3xl font-bold md:text-4xl">
              {event.name}
            </h1>
          </div>

          {/* ✅ Show specific information */}
          <div className="text-text-secondary mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex items-center gap-2">
              <Calendar className="text-primary h-4 w-4" />
              <span>{showFormattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="text-primary h-4 w-4" />
              <span>{showTimeRange}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="text-primary h-4 w-4" />
              <span>{event.location?.address || 'Sự kiện online'}</span>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
          <div className="space-y-6 lg:col-span-2">
            {/* ✅ Only show the selected show */}
            {selectedShow.tickets && selectedShow.tickets.length > 0 ? (
              <TicketShowGroup show={selectedShow} />
            ) : (
              <div className="border-border-default bg-background-secondary text-text-secondary rounded-lg border p-8 text-center">
                Chưa có vé được mở bán cho suất diễn này.
              </div>
            )}
          </div>

          <div className="hidden lg:col-span-1 lg:block">
            <div className="sticky top-24">
              {/* ✅ Pass selected show to cart summary */}
              <CartSummary event={event} selectedShow={selectedShow} />
            </div>
          </div>
        </div>
      </main>

      {/* ✅ Pass selected show to mobile cart */}
      <MobileCartSummary event={event} selectedShow={selectedShow} />
    </div>
  );
}
