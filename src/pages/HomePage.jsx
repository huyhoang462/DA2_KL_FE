import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import BannerCarousel from '../components/features/event/BannerCarousel';
import BannerCarouselSkeleton from '../components/ui/BannerCarouselSkeleton';
import EventCard from '../components/ui/EventCard';
import EventCardSkeleton from '../components/ui/EventCardSkeleton';
import { cleanUp, getAllEvents } from '../services/eventService';

const HomePage = () => {
  const {
    data: allEvents,
    isLoading: isLoadingAll,
    error: errorAll,
  } = useQuery({
    queryKey: ['events', 'all'],
    queryFn: getAllEvents,
    enabled: true,
  });

  useEffect(() => {
    console.log('=== ALL EVENTS ===');
    console.log('Loading:', isLoadingAll);
    console.log('Error:', errorAll);
    console.log('Data:', allEvents);
  }, [allEvents, isLoadingAll, errorAll]);

  const handleCleanup = async () => {
    try {
      await cleanUp();
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  };

  return (
    <div className="container mx-auto pb-8">
      <section className="mb-12">
        <h2 className="text-text-primary mb-6 text-2xl font-bold">
          Sự kiện nổi bật
        </h2>
        {isLoadingAll ? (
          <BannerCarouselSkeleton />
        ) : (
          <BannerCarousel events={allEvents} />
        )}
      </section>

      <section>
        <h2 className="text-text-primary mb-6 text-3xl font-bold">
          Đang chờ bạn khám phá
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {isLoadingAll
            ? [...Array(8)].map((_, index) => (
                <EventCardSkeleton key={`skeleton-${index}`} />
              ))
            : allEvents?.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
