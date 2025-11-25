import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../../utils/lib';
import Button from '../../ui/Button';
import { Link } from 'react-router-dom';

const TicketItem = ({ ticket }) => {
  return (
    <div className="border-border-subtle bg-background border-t p-4 last:border-b-0">
      <div className="mx-4 flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
        <p className="text-text-primary font-semibold">{ticket.name}</p>
        <p className="text-primary text-base font-bold">
          {ticket.price.toLocaleString()} VNĐ
        </p>
      </div>
      {ticket.description && (
        <p className="text-text-secondary mt-1 ml-4 text-sm">
          {ticket.description}
        </p>
      )}
    </div>
  );
};

const ShowtimeAccordionItem = ({ show, isOpen, onToggle }) => {
  const formattedStartTime = new Date(show.startTime).toLocaleTimeString(
    'vi-VN',
    {
      hour: '2-digit',
      minute: '2-digit',
    }
  );
  const formattedDate = new Date(show.startTime).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="border-border-default bg-background-secondary overflow-hidden rounded-lg border">
      <div className="bg-background-secondary flex items-center justify-between px-4 py-3">
        <div
          className="flex flex-1 flex-col pr-3 text-left transition"
          onClick={onToggle}
          aria-expanded={isOpen}
        >
          <p className="text-text-primary text-lg font-semibold">{show.name}</p>
          <p className="text-text-secondary text-sm">
            {`${formattedStartTime} - ${formattedDate}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/select-tickets/${show.event}`}>
            <Button className="px-3 py-1.5">Mua vé</Button>
          </Link>

          <ChevronDown
            className={cn(
              'text-text-secondary h-4 w-4 transition-transform duration-300',
              isOpen ? 'rotate-180' : 'rotate-0'
            )}
          />
        </div>
      </div>

      <div
        className={cn(
          'grid transition-all duration-500 ease-in-out',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
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
    setOpenShowId((prev) => (prev === showId ? null : showId));
  };

  if (!shows || shows.length === 0) {
    return (
      <div className="bg-background-secondary text-text-secondary border-border-default rounded-lg border p-6 text-center">
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
