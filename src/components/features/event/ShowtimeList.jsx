// src/components/features/event/ShowtimeList.jsx
import React, { useState } from 'react';
import { ChevronDown, Clock, Calendar } from 'lucide-react';
import { cn } from '../../../utils/lib';
import Button from '../../ui/Button';
import { Link, useNavigate } from 'react-router-dom';

const TicketItem = ({ ticket }) => {
  const available = ticket.quantityTotal - ticket.quantitySold;
  const isAvailable = available > 0;

  return (
    <div className="mx-4 border-t border-gray-100 bg-white p-4 first:border-t-0 last:rounded-b-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900">{ticket.name}</h4>
            {!isAvailable && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                Hết vé
              </span>
            )}
          </div>
          {ticket.description && (
            <p className="mt-1 text-sm text-gray-600">{ticket.description}</p>
          )}
        </div>
        <div className="text-right">
          <p
            className={cn(
              'text-lg font-bold',
              isAvailable ? 'text-primary' : 'text-gray-400'
            )}
          >
            {ticket.price.toLocaleString()} VNĐ
          </p>
        </div>
      </div>
    </div>
  );
};

const ShowtimeAccordionItem = ({ show, isOpen, onToggle, eventId }) => {
  const navigate = useNavigate();
  const startTime = new Date(show.startTime);
  const endTime = new Date(show.endTime);

  const formattedStartTime = startTime.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedEndTime = endTime.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedDate = startTime.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Calculate total available tickets
  const totalAvailable =
    show.tickets?.reduce(
      (sum, ticket) => sum + (ticket.quantityTotal - ticket.quantitySold),
      0
    ) || 0;

  const hasAvailableTickets = totalAvailable > 0;

  const handleClickBuyTickets = (e) => {
    e.stopPropagation();
    navigate(`/select-tickets/${eventId}/${show._id || show.id}`);
  };
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div
        className="flex cursor-pointer items-center justify-between bg-gray-50 px-6 py-4 transition-colors hover:bg-gray-100"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {show.name || 'Suất diễn chính'}
            </h3>
            {!hasAvailableTickets && (
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                Hết vé
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>
                {formattedStartTime} - {formattedEndTime}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            disabled={
              !hasAvailableTickets ||
              show?.status === 'completed' ||
              show?.status === 'ongoing'
            }
            onClick={handleClickBuyTickets}
            className={cn(
              'min-w-[100px]',
              !hasAvailableTickets && 'cursor-not-allowed'
            )}
          >
            {hasAvailableTickets
              ? show.status === 'completed'
                ? 'Đã kết thúc'
                : 'Mua vé'
              : 'Hết vé'}
          </Button>

          <button className="rounded-full p-2 transition-colors hover:bg-gray-200">
            <ChevronDown
              className={cn(
                'h-5 w-5 text-gray-500 transition-transform duration-300',
                isOpen ? 'rotate-180' : 'rotate-0'
              )}
            />
          </button>
        </div>
      </div>

      <div
        className={cn(
          'grid transition-all duration-500 ease-in-out',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          {show.tickets && show.tickets.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {show.tickets.map((ticket) => (
                <TicketItem key={ticket._id || ticket.id} ticket={ticket} />
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p>Chưa có vé nào được mở bán cho suất diễn này</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ShowtimeList({ shows, eventId }) {
  const [openShowId, setOpenShowId] = useState(
    shows?.[0]?._id || shows?.[0]?.id || null
  );

  const handleToggle = (showId) => {
    setOpenShowId((prev) => (prev === showId ? null : showId));
  };

  if (!shows || shows.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <Calendar className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          Chưa có suất diễn
        </h3>
        <p className="text-gray-600">
          Hiện tại chưa có thông tin về các suất diễn cho sự kiện này.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-showtime-list>
      {shows.map((show) => (
        <ShowtimeAccordionItem
          key={show._id || show.id}
          show={show}
          isOpen={openShowId === (show._id || show.id)}
          onToggle={() => handleToggle(show._id || show.id)}
          eventId={eventId}
        />
      ))}
    </div>
  );
}
