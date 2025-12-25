import React from 'react';
import { useQuery } from '@tanstack/react-query';
import BannerCarousel from '../components/features/event/BannerCarousel';
import BannerCarouselSkeleton from '../components/ui/BannerCarouselSkeleton';
import EventSection from '../components/features/event/EventSection';
import {
  getAllEvents,
  getNewEvents,
  getThisWeekendEvents,
  getTrendingEvents,
  getSellingFastEvents,
  getEventsByCategory,
} from '../services/eventService';

// Category IDs
const CATEGORIES = {
  MUSIC: '68ebc64c62eda4433ee01537',
  STAGE_ART: '68ebc84ab18508fd0c6d88c2',
  SPORTS: '68ebc854b18508fd0c6d88c5',
  WORKSHOP: '68ebc85eb18508fd0c6d88c8',
  OTHER: '68ebc863b18508fd0c6d88cb',
};

const HomePage = () => {
  const { data: allEvents, isLoading: isLoadingAll } = useQuery({
    queryKey: ['events', 'all'],
    queryFn: getAllEvents,
    enabled: true,
  });

  return (
    <div className="container mx-auto pt-4 pb-8">
      <section className="mb-12">
        {isLoadingAll ? (
          <BannerCarouselSkeleton />
        ) : (
          <>
            <BannerCarousel events={allEvents?.slice(0, 6) || []} />
          </>
        )}
      </section>

      <EventSection
        title="Sự kiện mới nhất"
        queryKey={['events', 'new']}
        queryFn={() => getNewEvents(8)}
      />

      <EventSection
        title="Sự kiện cuối tuần này"
        queryKey={['events', 'this-weekend']}
        queryFn={() => getThisWeekendEvents(8)}
      />

      <EventSection
        title="Đang thịnh hành"
        badge="🔥"
        queryKey={['events', 'trending']}
        queryFn={() => getTrendingEvents(8)}
      />

      <EventSection
        title="Sắp hết vé"
        badge="⚡"
        queryKey={['events', 'selling-fast']}
        queryFn={() => getSellingFastEvents(8)}
      />

      <EventSection
        title="Âm nhạc"
        badge="🎵"
        queryKey={['events', 'category', CATEGORIES.MUSIC]}
        queryFn={() => getEventsByCategory(CATEGORIES.MUSIC, 8)}
      />

      <EventSection
        title="Sân khấu & Nghệ thuật"
        badge="🎭"
        queryKey={['events', 'category', CATEGORIES.STAGE_ART]}
        queryFn={() => getEventsByCategory(CATEGORIES.STAGE_ART, 8)}
      />

      <EventSection
        title="Thể thao"
        badge="⚽"
        queryKey={['events', 'category', CATEGORIES.SPORTS]}
        queryFn={() => getEventsByCategory(CATEGORIES.SPORTS, 8)}
      />

      <EventSection
        title="Workshop"
        badge="📚"
        queryKey={['events', 'category', CATEGORIES.WORKSHOP]}
        queryFn={() => getEventsByCategory(CATEGORIES.WORKSHOP, 8)}
      />

      <EventSection
        title="Khác"
        badge="✨"
        queryKey={['events', 'category', CATEGORIES.OTHER]}
        queryFn={() => getEventsByCategory(CATEGORIES.OTHER, 8)}
      />
    </div>
  );
};

export default HomePage;
