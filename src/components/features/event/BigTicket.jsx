// src/components/features/event/BigTicket.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import Button from '../../../components/ui/Button';

export default function BigTicket({ event, onNav }) {
  const getMinPrice = (shows) => {
    if (!shows || shows.length === 0) return 0;
    const allTickets = shows.flatMap((show) => show.tickets);

    if (allTickets.length === 0) return 0;
    return Math.min(...allTickets.map((ticket) => ticket.price));
  };

  const minPrice = getMinPrice(event.shows);
  const hasMultipleShows = event.shows && event.shows.length > 1;

  const formattedDate = new Date(event.startDate).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // ✅ Handler for scroll to showtime list when multiple shows
  const handleScrollToShowtimes = () => {
    const showtimeSection = document.querySelector('[data-showtime-list]');
    if (showtimeSection) {
      showtimeSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  // ✅ Get single show ID for direct navigation
  const getSingleShowId = () => {
    if (event.shows && event.shows.length === 1) {
      return event.shows[0]._id || event.shows[0].id;
    }
    return null;
  };

  return (
    <div className="mx-auto mb-8 w-full">
      <div className="text-text-primary bg-background-secondary flex flex-col overflow-hidden rounded-2xl md:grid md:grid-cols-5">
        <div className="border-border-default order-first md:order-last md:col-span-3 md:rounded-2xl md:border md:border-l-0">
          <img
            className="aspect-video h-full w-full object-cover md:aspect-auto md:rounded-2xl"
            src={event.bannerImageUrl}
            alt={event.name}
          />
        </div>

        <div className="bg-background-secondary border-border-default relative col-span-2 flex flex-col justify-between rounded-b-2xl border-x border-b p-6 md:rounded-2xl md:border md:border-r-0 md:p-8">
          <div className="bg-background-primary border-border-default absolute top-0 right-0 hidden h-16 w-16 translate-x-1/2 -translate-y-1/2 transform rounded-full border md:block"></div>
          <div className="bg-background-primary border-border-default absolute right-0 bottom-0 hidden h-16 w-16 translate-x-1/2 translate-y-1/2 transform rounded-full border md:block"></div>

          <div>
            <h1 className="text-xl font-bold break-words md:text-2xl lg:text-3xl">
              {event.name}
            </h1>
            <div className="text-text-secondary mt-4 space-y-4">
              <div className="flex items-start">
                <Calendar className="text-primary mt-0.5 mr-3 inline h-5 w-5 flex-shrink-0" />
                <span className="text-text-primary text-sm md:text-base">
                  {formattedDate}
                </span>
              </div>
              <div className="flex items-start">
                <MapPin className="text-primary mt-0.5 mr-3 inline h-5 w-5 flex-shrink-0" />
                <div className="text-sm md:text-base">
                  <span className="text-text-primary block">
                    {event.location?.address || 'Sự kiện online'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-border-default mt-6 border-t pt-4">
            {minPrice > 0 && (
              <div className="mb-4">
                <div className="text-text-secondary text-sm font-semibold md:text-base">
                  Giá vé từ
                </div>

                <div className="text-primary text-xl font-bold md:text-2xl">
                  {minPrice.toLocaleString()} VNĐ
                </div>
              </div>
            )}

            {/* ✅ Conditional button based on number of shows */}
            {hasMultipleShows ? (
              <Button
                className="w-full"
                size="lg"
                onClick={handleScrollToShowtimes}
              >
                Chọn suất diễn
              </Button>
            ) : (
              <Link to={`/select-tickets/${event._id}/${getSingleShowId()}`}>
                <Button className="w-full" size="lg">
                  Mua vé ngay
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
