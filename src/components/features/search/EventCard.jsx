import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';

export default function EventCard({ event }) {
  const formattedDate = new Date(event.date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <Link
      to={`/event-detail/${event.id}`}
      className="border-border-default bg-background-secondary flex flex-col overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="aspect-[16/9] w-full overflow-hidden">
        <img
          src={event.bannerImageUrl}
          alt={event.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-text-primary group-hover:text-primary text-lg leading-tight font-bold transition-colors">
          {event.name}
        </h3>
        <div className="text-text-secondary mt-2 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span>{event.location}</span>
          </div>
        </div>
        {event.price && event.price > 0 && (
          <div className="border-border-subtle mt-4 border-t pt-3">
            <p className="text-text-secondary text-sm">Giá từ</p>
            <p className="text-primary font-bold">
              {event.price.toLocaleString()}đ
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}
