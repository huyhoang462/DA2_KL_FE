import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import EventCard from '../../ui/EventCard';
import EventCardSkeleton from '../../ui/EventCardSkeleton';

const EventSection = ({
  title,
  queryKey,
  queryFn,
  badge,
  showViewAll = true,
}) => {
  const {
    data: events,
    isLoading,
    error,
  } = useQuery({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
  });

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-text-primary text-2xl font-bold">
            {title} {badge && <span className="ml-2">{badge}</span>}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, index) => (
            <EventCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      </section>
    );
  }

  if (error || !events || events.length === 0) {
    return null; // Don't show section if no events
  }

  return (
    <section className="mb-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-text-primary text-2xl font-bold">
          {title} {badge && <span className="ml-2">{badge}</span>}
        </h2>
        {showViewAll && (
          <Link
            to="/search"
            className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm font-medium transition-colors"
          >
            Xem tất cả
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
};

export default EventSection;
