import React from 'react';
import { Eye, Trash2, Star, Calendar, TicketIcon, Ban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../ui/Button';
import EventStatusBadge from './EventStatusBadge';

const EventRow = React.memo(
  ({
    event,
    onViewDetails,
    onToggleFeatured,
    onDelete,
    isTogglingFeatured,
  }) => {
    const navigate = useNavigate();

    const handleRowClick = (e) => {
      // Don't navigate if clicking on buttons or interactive elements
      if (
        e.target.closest('button') ||
        e.target.closest('a') ||
        e.target.closest('[role="button"]')
      ) {
        return;
      }
      navigate(`/admin/events/${event.id}`);
    };

    return (
      <tr
        className="hover:bg-background-primary cursor-pointer transition-colors"
        onClick={handleRowClick}
      >
        <td className="max-w-md py-4 pr-4 pl-5">
          <div className="flex items-start gap-2.5">
            {event.bannerImageUrl ? (
              <img
                src={event.bannerImageUrl}
                alt={event.name}
                className="h-16 w-24 flex-shrink-0 rounded-lg object-cover shadow-sm"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="64" viewBox="0 0 96 64"%3E%3Crect width="96" height="64" fill="%23374151"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%239CA3AF"%3ENo Image%3C/text%3E%3C/svg%3E';
                }}
                loading="lazy"
              />
            ) : (
              <div className="bg-background-primary flex h-16 w-24 flex-shrink-0 items-center justify-center rounded-lg">
                <Calendar className="text-text-secondary h-6 w-6" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-text-primary mb-1 line-clamp-2 text-sm leading-snug font-semibold">
                {event.name}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-text-secondary flex items-center gap-1 text-xs">
                  <Calendar className="h-3 w-3 flex-shrink-0" />
                  {new Date(event.startDate).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium ${
                    event.format === 'online'
                      ? 'bg-blue-500/10 text-blue-500'
                      : 'bg-purple-500/10 text-purple-500'
                  }`}
                >
                  {event.format === 'online' ? '🌐 Online' : '📍 Offline'}
                </span>
              </div>
            </div>
          </div>
        </td>
        <td className="px-4 py-4">
          <div className="flex flex-col gap-2">
            <EventStatusBadge status={event.status} />
            {event.featured && (
              <span className="bg-warning/10 text-warning flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
                <Star className="h-3 w-3 fill-current" />
                Featured
              </span>
            )}
          </div>
        </td>
        <td className="px-4 py-4">
          <p className="text-text-primary text-sm font-medium">
            {event.creator?.fullName || 'N/A'}
          </p>
        </td>
        <td className="px-4 py-4">
          <div className="flex items-center gap-1.5">
            <TicketIcon className="text-text-secondary h-4 w-4 flex-shrink-0" />
            <span className="text-text-primary font-semibold">
              {event.totalTicketsSold || 0}
            </span>
            <span className="text-text-secondary text-xs">
              / {event.totalTicketsAvailable || 0}
            </span>
          </div>
        </td>
        <td className="px-4 py-4">
          <span className="text-text-secondary text-sm">
            {new Date(event.createdAt).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </span>
        </td>
        <td className="py-4 pr-5 pl-4 text-right">
          <div className="flex items-center justify-end gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(event.id);
              }}
              title="Xem chi tiết"
            >
              <Eye className="h-4 w-4" />
            </Button>

            {(event.status === 'upcoming' || event.status === 'ongoing') && (
              <Button
                size="sm"
                variant={event.featured ? 'warning' : 'outline'}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFeatured(event);
                }}
                title={event.featured ? 'Bỏ featured' : 'Đánh dấu featured'}
              >
                <Star className="h-4 w-4" />
              </Button>
            )}

            <Button
              size="sm"
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(event);
              }}
              title="Hủy sự kiện"
            >
              <Ban className="h-4 w-4" />
            </Button>
          </div>
        </td>
      </tr>
    );
  }
);

EventRow.displayName = 'EventRow';

export default EventRow;
