// src/pages/event/partials/BigTicket.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import  Button  from '../../../components/ui/Button'; 

export default function BigTicket({ event }) {
  const getMinPrice = (shows) => {
    if (!shows || shows.length === 0) return 0;
    const allTickets = shows.flatMap(show => show.tickets);
    if (allTickets.length === 0) return 0;
    return Math.min(...allTickets.map(ticket => ticket.price));
  };

  const minPrice = getMinPrice(event.shows);

  const formattedDate = new Date(event.startDate).toLocaleDateString("vi-VN", {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
  });

  return (
   <div className="w-full mb-8">
  
      <div className="flex flex-col md:grid md:grid-cols-3 text-text-primary rounded-2xl bg-background-secondary overflow-hidden ">
        
 
        <div className="order-first md:order-last md:col-span-2">
          <img
            className="w-full h-full object-cover aspect-video md:aspect-auto"
            src={event.bannerImageUrl}
            alt={event.name}
          />
        </div>

    
        <div className="relative flex flex-col justify-between col-span-1 p-6 md:p-8 bg-foreground md:bg-[#e9ecef]">
    
          <div className="hidden md:block absolute w-16 h-16 rounded-full bg-background-primary top-0 right-0 transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="hidden md:block absolute w-16 h-16 rounded-full bg-background-primary bottom-0 right-0 transform translate-x-1/2 translate-y-1/2"></div>
          
          <div>
        
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold break-words">
              {event.name}
            </h1>
            <div className="mt-4 space-y-4 text-text-secondary">
              <div className="flex items-start">
                <Calendar className="inline h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-sm md:text-base text-text-primary">{formattedDate}</span>
              </div>
              <div className="flex items-start">
                <MapPin className="inline h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                <div className="text-sm md:text-base">
                  <span className="block text-text-primary">{event.location.address}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border-default">
            {minPrice > 0 && (
              <div className="mb-4">
                <div className="text-sm md:text-base font-semibold text-text-secondary">
                  Giá vé từ
                </div>
         
                <div className="text-xl md:text-2xl font-bold text-primary">
                  {minPrice.toLocaleString()} VNĐ
                </div>
              </div>
            )}
             <Button className="w-full" >
                Mua vé ngay
              </Button>
          </div>
        </div>
      </div>
    </div>
  );
}