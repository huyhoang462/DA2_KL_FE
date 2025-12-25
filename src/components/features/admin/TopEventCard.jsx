import React from 'react';
import { Calendar, Ticket, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const TopEventCard = ({ event }) => {
  const {
    id,
    name,
    bannerImageUrl,
    startDate,
    totalSold,
    totalAvailable,
    sellRate,
    category,
  } = event;

  return (
    <Link
      to={`/admin/events/${id}`}
      className="bg-background-secondary border-border-default hover:border-primary group block overflow-hidden rounded-lg border transition-all hover:shadow-lg"
    >
      <div className="relative h-32 overflow-hidden">
        <img
          src={bannerImageUrl || '/eventDefault.png'}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Sell Rate Badge */}
        <div className="absolute right-2 bottom-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm">
          <TrendingUp className="h-3 w-3 text-green-400" />
          <span className="text-xs font-semibold text-white">
            {sellRate.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="p-4">
        <h4 className="text-text-primary group-hover:text-primary mb-2 line-clamp-1 font-semibold">
          {name}
        </h4>

        <div className="mb-3 flex items-center gap-2 text-xs">
          <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5">
            {category?.name}
          </span>
          <span className="text-text-secondary flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(startDate).toLocaleDateString('vi-VN')}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm">
            <Ticket className="text-primary h-4 w-4" />
            <span className="text-text-primary font-semibold">{totalSold}</span>
            <span className="text-text-secondary">/ {totalAvailable}</span>
          </div>

          <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-700">
            <div
              className="bg-primary h-full transition-all"
              style={{ width: `${sellRate}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TopEventCard;
