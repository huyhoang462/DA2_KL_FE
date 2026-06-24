// src/components/features/event/ShowtimeList.jsx
import React, { useState } from 'react';
import { ChevronDown, Clock, Calendar } from 'lucide-react';
import { cn } from '../../../utils/lib';
import Button from '../../ui/Button';
import { useNavigate } from 'react-router-dom';
import useUsdtVndRate from '../../../hooks/useUsdtVndRate';
import PriceDisplay from '../../ui/PriceDisplay';

const TicketItem = ({ ticket, exchangeRateVndPerUsdt }) => {
  const available = ticket.quantityTotal - ticket.quantitySold;
  const isAvailable = available > 0;

  return (
    <div className="border-border-subtle bg-foreground hover:bg-background-secondary border-t p-4 transition-colors first:border-t-0">
      <div className="flex items-center justify-between">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2">
            <h4 className="text-text-primary text-sm font-bold">
              {ticket.name}
            </h4>
            {!isAvailable && (
              <span className="bg-destructive-background text-destructive rounded px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                Hết vé
              </span>
            )}
          </div>
          {ticket.description && (
            <p className="text-text-secondary mt-1 line-clamp-2 text-xs font-medium">
              {ticket.description}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 text-right">
          <PriceDisplay
            amountUsdt={ticket.price}
            rateVndPerUsdt={exchangeRateVndPerUsdt}
            layout="stacked"
            vndWrapper="plain"
            usdtClassName={cn(
              'text-sm md:text-base',
              isAvailable
                ? 'text-primary font-bold'
                : 'text-text-placeholder font-bold'
            )}
            vndClassName={cn(
              'text-xs',
              isAvailable
                ? 'text-text-secondary font-semibold'
                : 'text-text-placeholder font-medium'
            )}
          />
        </div>
      </div>
    </div>
  );
};

const ShowtimeAccordionItem = ({
  show,
  isOpen,
  onToggle,
  eventId,
  exchangeRateVndPerUsdt,
}) => {
  const navigate = useNavigate();
  const startTime = new Date(show.startTime);
  const endTime = new Date(show.endTime);

  const formattedStartTime = startTime.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  });
  const formattedEndTime = endTime.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  });
  const formattedDate = startTime.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  });

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
    <div className="border-border-default bg-background-secondary overflow-hidden rounded-xl border transition-all">
      <div
        className="bg-foreground hover:bg-background-primary flex cursor-pointer flex-col gap-3 p-4 transition-colors sm:flex-row sm:items-center sm:justify-between"
        onClick={onToggle}
      >
        <div className="flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <h3 className="text-text-primary text-base font-bold">
              {show.name || 'Suất diễn chính'}
            </h3>
            {!hasAvailableTickets && (
              <span className="bg-destructive-background text-destructive rounded px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                Hết vé
              </span>
            )}
          </div>

          <div className="text-text-secondary flex items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-1">
              <Calendar className="text-primary h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="text-primary h-3.5 w-3.5" />
              <span>
                {formattedStartTime} - {formattedEndTime}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <Button
            size="sm"
            disabled={
              !hasAvailableTickets ||
              show?.status === 'completed' ||
              show?.status === 'ongoing'
            }
            onClick={handleClickBuyTickets}
            className={cn(
              'w-full sm:w-auto',
              !hasAvailableTickets && 'cursor-not-allowed'
            )}
          >
            {hasAvailableTickets
              ? show.status === 'completed'
                ? 'Đã kết thúc'
                : 'Mua vé'
              : 'Hết vé'}
          </Button>

          <button className="bg-background-secondary hover:bg-border-subtle flex h-8 w-8 items-center justify-center rounded-full transition-colors">
            <ChevronDown
              className={cn(
                'text-text-primary h-4 w-4 transition-transform duration-300',
                isOpen ? 'rotate-180' : 'rotate-0'
              )}
            />
          </button>
        </div>
      </div>

      <div
        className={cn(
          'grid transition-all duration-300 ease-in-out',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          {show.tickets && show.tickets.length > 0 ? (
            <div className="divide-border-subtle divide-y">
              {show.tickets.map((ticket) => (
                <TicketItem
                  key={ticket._id || ticket.id}
                  ticket={ticket}
                  exchangeRateVndPerUsdt={exchangeRateVndPerUsdt}
                />
              ))}
            </div>
          ) : (
            <div className="text-text-secondary p-6 text-center text-sm font-medium">
              <p>Chưa có vé nào được mở bán cho suất diễn này</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ShowtimeList({ shows, eventId }) {
  const { data: exchangeRateVndPerUsdt } = useUsdtVndRate();
  const [openShowId, setOpenShowId] = useState(
    shows?.[0]?._id || shows?.[0]?.id || null
  );

  const handleToggle = (showId) => {
    setOpenShowId((prev) => (prev === showId ? null : showId));
  };

  if (!shows || shows.length === 0) {
    return (
      <div className="border-border-default bg-foreground rounded-xl border p-8 text-center shadow-sm">
        <div className="bg-background-primary mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
          <Calendar className="text-text-placeholder h-6 w-6" />
        </div>
        <h3 className="text-text-primary mb-1 text-base font-bold">
          Chưa có suất diễn
        </h3>
        <p className="text-text-secondary text-sm font-medium">
          Hiện tại chưa có thông tin về các suất diễn cho sự kiện này.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-showtime-list>
      {shows.map((show) => (
        <ShowtimeAccordionItem
          key={show._id || show.id}
          show={show}
          isOpen={openShowId === (show._id || show.id)}
          onToggle={() => handleToggle(show._id || show.id)}
          eventId={eventId}
          exchangeRateVndPerUsdt={exchangeRateVndPerUsdt}
        />
      ))}
    </div>
  );
}
