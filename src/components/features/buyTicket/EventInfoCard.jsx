// src/pages/payment/partials/EventInfoCard.jsx
import React from 'react';
import { Calendar, MapPin } from 'lucide-react';

export default function EventInfoCard({ event }) {
  const formattedDate = new Date(event.startDate).toLocaleString('vi-VN', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return (
    <div className="border-border-default bg-background-secondary rounded-lg border p-6">
      <div className="aspect-[16/9] w-full overflow-hidden rounded-md">
        <img
          src={event.bannerImageUrl}
          alt={event.name}
          className="h-full w-full object-cover"
        />
      </div>
      <h3 className="text-text-primary mt-4 text-lg font-bold">{event.name}</h3>
      <div className="text-text-secondary mt-2 space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{event.location.address}</span>
        </div>
      </div>
    </div>
  );
}
