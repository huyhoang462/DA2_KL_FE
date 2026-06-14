// src/pages/user/SelectTicketsPage.jsx
import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
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
import {
  getTicketTypesByShowId,
  getTicketsByShowId,
} from '../../services/ticketService';

export default function SelectTicketsPage() {
  const { id: eventId, showId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  useEffect(() => {
    if (showId) {
      dispatch(startNewCart({ id: showId }));
    }
  }, [showId, dispatch]);

  const handleGetTicketInfo = async () => {
    try {
      await getTicketTypesByShowId(showId);
      await getTicketsByShowId(showId);
    } catch (error) {
      console.error('GETINFO error:', error);
    }
  };

  const selectedShow = useMemo(() => {
    handleGetTicketInfo();
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

  if (!selectedShow) {
    return <Navigate to={`/event-detail/${eventId}`} replace />;
  }

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
    <div className="bg-background-primary text-text-primary">
      {/* ── Hero Header với banner ảnh ── */}
      <div className="bg-background-secondary border-border-subtle border-b">
        <div className="container mx-auto px-4">
          {/* Back button */}
          <div className="pt-4 pb-2">
            <button
              onClick={() => navigate(`/event-detail/${eventId}`)}
              className="text-text-secondary hover:text-primary inline-flex items-center gap-1.5 text-sm font-medium transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại sự kiện
            </button>
          </div>

          <div className="flex flex-col gap-5 pb-6 md:flex-row md:items-center md:gap-8">
            {/* Banner thumbnail */}
            {event.bannerImageUrl && (
              <div className="border-border-default h-28 w-full flex-shrink-0 overflow-hidden rounded-xl border md:h-32 md:w-52">
                <img
                  src={event.bannerImageUrl}
                  alt={event.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* Info */}
            <div className="min-w-0 flex-1">
              {/* Step indicator */}

              <h1 className="text-text-primary line-clamp-2 text-2xl leading-tight font-black md:text-3xl">
                {event.name}
              </h1>

              {/* Show details */}
              <div className="text-text-secondary mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="bg-primary/20 flex h-6 w-6 items-center justify-center rounded-md">
                    <Calendar className="text-primary h-3.5 w-3.5" />
                  </div>
                  <span className="font-medium">{showFormattedDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="bg-primary/20 flex h-6 w-6 items-center justify-center rounded-md">
                    <Clock className="text-primary h-3.5 w-3.5" />
                  </div>
                  <span className="font-medium">{showTimeRange}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="bg-primary/20 flex h-6 w-6 items-center justify-center rounded-md">
                    <MapPin className="text-primary h-3.5 w-3.5" />
                  </div>
                  <span className="line-clamp-1 font-medium">
                    {event.location?.address || 'Sự kiện online'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Left: ticket list */}
          <div className="space-y-4 lg:col-span-2">
            {selectedShow.tickets && selectedShow.tickets.length > 0 ? (
              <TicketShowGroup show={selectedShow} />
            ) : (
              <div className="border-border-default bg-background-secondary rounded-xl border p-12 text-center">
                <div className="bg-foreground mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Calendar className="text-text-secondary h-6 w-6" />
                </div>
                <p className="text-text-primary font-semibold">Chưa có vé</p>
                <p className="text-text-secondary mt-1 text-sm">
                  Chưa có vé được mở bán cho suất diễn này.
                </p>
              </div>
            )}
          </div>

          {/* Right: cart summary (desktop) */}
          <div className="hidden lg:col-span-1 lg:block">
            <div className="sticky top-24">
              <CartSummary event={event} selectedShow={selectedShow} />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile cart */}
      <MobileCartSummary event={event} selectedShow={selectedShow} />
    </div>
  );
}
