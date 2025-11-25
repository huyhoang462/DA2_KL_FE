import React, { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';

import { getEventById } from '../../services/eventService';
import { startNewCart } from '../../store/slices/cartSlice';

import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorDisplay from '../../components/ui/ErrorDisplay';
import TicketShowGroup from '../../components/features/buyTicket/TicketShowGroup';
import CartSummary from '../../components/features/buyTicket/CartSummary';
import MobileCartSummary from '../../components/features/buyTicket/MobileCartSummary';

export default function SelectTicketsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const {
    data: event,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['eventForSelection', id],
    queryFn: () => getEventById(id),

    enabled: !!id,
  });

  const cartItems = useSelector((state) => state.cart.items);

  useEffect(() => {
    if (id) {
      dispatch(startNewCart({ id }));
    }
  }, [id, dispatch]);

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  if (isError) return <ErrorDisplay message={error.message} />;
  if (!event) return <ErrorDisplay message="Không tìm thấy sự kiện." />;
  const formattedDate = new Date(event.startDate).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-background-primary text-text-primary min-h-[calc(100vh-64px)]">
      <div className="border-border-subtle bg-background-secondary mx-auto mb-4 rounded-xl border-b py-6">
        {/* <Link
            to={`/event-detail/${id}`}
            className="text-text-secondary hover:text-text-primary mb-6 inline-flex items-center gap-2 text-sm font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại</span>
          </Link> */}
        <div className="container mx-auto flex flex-col px-4">
          <div className="flex gap-4">
            <h1 className="text-text-primary text-3xl font-bold md:text-4xl">
              {event.name}
            </h1>
          </div>
          <div className="text-text-secondary mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex items-center gap-2">
              <Calendar className="text-primary h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="text-primary h-4 w-4" />
              <span>{event.location.address}</span>
            </div>
          </div>
        </div>
      </div>
      <main className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
          <div className="space-y-6 lg:col-span-2">
            {event.shows && event.shows.length > 0 ? (
              event.shows.map((show) => (
                <TicketShowGroup key={show._id} show={show} />
              ))
            ) : (
              <div className="border-border-default bg-background-secondary text-text-secondary rounded-lg border p-8 text-center">
                Chưa có vé được mở bán cho sự kiện này.
              </div>
            )}
          </div>

          <div className="hidden lg:col-span-1 lg:block">
            <div className="sticky top-24">
              <CartSummary event={event} />
            </div>
          </div>
        </div>
      </main>

      <MobileCartSummary event={event} />
    </div>
  );
}
