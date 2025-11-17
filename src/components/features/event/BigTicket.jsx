import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import Button from '../../../components/ui/Button';

export default function BigTicket({ event, onNav }) {
  const getMinPrice = (shows) => {
    if (!shows || shows.length === 0) return 0;
    const allTickets = shows.flatMap((show) => show.tickets);
    console.log('allticket: ', allTickets);

    if (allTickets.length === 0) return 0;
    return Math.min(...allTickets.map((ticket) => ticket.price));
  };

  const minPrice = getMinPrice(event.shows);

  const formattedDate = new Date(event.startDate).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="mx-auto mb-8 w-full">
      <div className="text-text-primary bg-background-secondary flex flex-col overflow-hidden rounded-2xl md:grid md:grid-cols-5">
        <div className="order-first md:order-last md:col-span-3">
          <img
            className="aspect-video h-full w-full object-cover md:aspect-auto"
            src={event.bannerImageUrl}
            alt={event.name}
          />
        </div>

        <div className="relative col-span-2 flex flex-col justify-between bg-[#e9ecef] p-6 md:p-8">
          <div className="bg-background-primary absolute top-0 right-0 hidden h-16 w-16 translate-x-1/2 -translate-y-1/2 transform rounded-full md:block"></div>
          <div className="bg-background-primary absolute right-0 bottom-0 hidden h-16 w-16 translate-x-1/2 translate-y-1/2 transform rounded-full md:block"></div>

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
                    {event.location.address}
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
            <Link to={`/select-tickets/${event.id}`}>
              <Button className="w-full">Mua vé ngay</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
