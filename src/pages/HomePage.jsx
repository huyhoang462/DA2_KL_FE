import React from 'react';
import { mockEvents } from '../utils/mockData';
import BannerCarousel from '../components/features/event/BannerCarousel';
import EventCard from '../components/ui/EventCard';
const HomePage = () => {
  return (
    <div className="mx-auto pb-8">
      <section className="mb-12">
        <h2 className="text-text-primary mb-6 text-2xl font-bold">
          Sự kiện nổi bật
        </h2>
        <BannerCarousel events={mockEvents} />
      </section>

      <section>
        <h2 className="text-text-primary mb-6 text-3xl font-bold">
          Đang chờ bạn khám phá
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {mockEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </div>
  );
};
export default HomePage;
