import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../../utils/lib';
import Button from '../../ui/Button';

const TicketItem = ({ ticket }) => {
  return (
    <div className="px-4 py-3 border-b border-border-default last:border-b-0 bg-background">
      <div className="flex ml-4 flex-col sm:flex-row justify-between sm:items-center gap-1">
        <p className="font-semibold text-text-primary">{ticket.name}</p>
        <p className="text-base font-bold text-primary">{ticket.price.toLocaleString()} VNĐ</p>
      </div>
      {ticket.description && (
        <p className="text-text-secondary  ml-4 mt-1 text-sm">{ticket.description}</p>
      )}
    </div>
  );
};

const ShowtimeAccordionItem = ({ show, isOpen, onToggle }) => {
  const formattedStartTime = new Date(show.startTime).toLocaleTimeString('vi-VN', {
    hour: '2-digit', minute: '2-digit'
  });
  const formattedDate = new Date(show.startTime).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  return (
    <div className="border border-border-default rounded-lg overflow-hidden bg-background-secondary">
      
      <div className="flex justify-between items-center px-4 py-3 bg-foreground">

        <button
          className="flex flex-col text-left flex-1 pr-3 transition"
          onClick={onToggle}
          aria-expanded={isOpen}
        >
          <p className="font-semibold text-lg text-text-primary">{show.name}</p>
          <p className="text-sm text-text-secondary">
            {`${formattedStartTime} - ${formattedDate}`}
          </p>
        </button>

        <div className="flex items-center gap-2">
          <Button className="px-3 py-1.5">
            Mua vé
          </Button>

          <ChevronDown
            className={cn(
              'h-4 w-4 text-text-secondary transition-transform duration-300',
              isOpen ? 'rotate-180' : 'rotate-0'
            )}
          />
        </div>

      </div>

      <div
        className={cn(
          "grid transition-all duration-500 ease-in-out",
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden ">
          {show.tickets.map((ticket) => (
            <TicketItem key={ticket._id} ticket={ticket} />
          ))}
        </div>
      </div>
    </div>
  );
};


export default function ShowtimeList({ shows }) {
  const [openShowId, setOpenShowId] = useState(shows?.[0]?._id || null);

  const handleToggle = (showId) => {
    setOpenShowId(prev => (prev === showId ? null : showId));
  };

  if (!shows || shows.length === 0) {
    return (
      <div className="bg-background-secondary text-text-secondary text-center p-6 rounded-lg border border-border-default">
        Hiện chưa có thông tin về các suất diễn và vé cho sự kiện này.
      </div>
    );
  }

  return (
    <div className="space-y-2">

      {shows.map((show) => (
        <ShowtimeAccordionItem
          key={show._id}
          show={show}
          isOpen={openShowId === show._id}
          onToggle={() => handleToggle(show._id)}
        />
      ))}
    </div>
  );
}
