import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import EventCard from '../../ui/EventCard';
import EventCardSkeleton from '../../ui/EventCardSkeleton';
import { cn } from '../../../utils/lib';

const DotButton = ({ selected, onClick }) => (
  <button
    className={cn(
      'h-2 w-2 rounded-full transition-all duration-300',
      selected
        ? 'bg-primary w-6'
        : 'bg-border-default hover:bg-border-default/80'
    )}
    type="button"
    onClick={onClick}
  />
);

const EventSection = ({
  title,
  queryKey,
  queryFn,
  badge,
  showViewAll = true,
  viewAllLink = '/search',
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    slidesToScroll: 1,
  });

  const [scrollSnaps, setScrollSnaps] = useState([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      // setSelectedIndex(emblaApi.selectedScrollSnap());
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };
    const onInit = () => {
      //  setScrollSnaps(emblaApi.scrollSnapList());
      onSelect();
    };

    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onInit);

    onInit();

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onInit);
    };
  }, [emblaApi]);

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
            to={viewAllLink}
            className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm font-medium transition-colors"
          >
            Xem tất cả
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="relative">
        {/* Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="-ml-4 flex">
            {events.map((event) => (
              <div
                key={event.id}
                className="min-w-0 flex-[0_0_100%] pl-4 sm:flex-[0_0_50%] md:flex-[0_0_33.333%] lg:flex-[0_0_25%]"
              >
                <EventCard event={event} />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        {canScrollPrev && (
          <button
            onClick={scrollPrev}
            className="bg-background-secondary hover:bg-primary absolute top-1/2 left-0 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full p-2 shadow-lg transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="text-text-primary h-5 w-5" />
          </button>
        )}

        {canScrollNext && (
          <button
            onClick={scrollNext}
            className="bg-background-secondary hover:bg-primary absolute top-1/2 right-0 z-10 translate-x-1/2 -translate-y-1/2 rounded-full p-2 shadow-lg transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="text-text-primary h-5 w-5" />
          </button>
        )}
      </div>
    </section>
  );
};

export default EventSection;
