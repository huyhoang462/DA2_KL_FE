import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin } from 'lucide-react';
import { cn } from '../../utils/lib';
import { trackEventView } from '../../services/eventService';

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatPrice = (price) => {
  if (price === 0) return 'Miễn phí';
  return `${price.toLocaleString('vi-VN')} ₫`;
};

export default function EventCard({ event, className }) {
  const navigate = useNavigate();

  if (!event) return null;

  const handleClick = (e) => {
    e.preventDefault();

    // Track view
    trackEventView(event.id);

    // Navigate
    navigate(`/event-detail/${event.id}`);
  };

  return (
    <Link
      to={`/event-detail/${event.id}`}
      onClick={handleClick}
      className={cn('group block', className)}
    >
      <div className="bg-background-secondary hover:shadow-primary/20 overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={event.bannerImageUrl}
            alt={event.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          <div className="absolute top-2 right-2 rounded-full bg-black/50 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {event.category.name}
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <h3
            className="text-text-primary group-hover:text-primary truncate text-base leading-tight font-bold transition-colors md:text-lg"
            title={event.name}
          >
            {event.name}
          </h3>
          <p className="text-primary mt-2 text-sm font-semibold md:text-base">
            Từ {formatPrice(event.lowestPrice)}
          </p>
          <div className="text-text-secondary mt-2 space-y-2 text-xs md:text-sm">
            <div className="flex items-start">
              <CalendarDays className="text-text-placeholder mt-0.5 mr-2 h-4 w-4 flex-shrink-0" />
              <span>{formatDate(event.startDate)}</span>
            </div>
            <div className="flex items-start">
              <MapPin className="text-text-placeholder mt-0.5 mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {event.format === 'offline'
                  ? event.location?.address
                  : 'Sự kiện online'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
