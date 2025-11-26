import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';

const statusStyles = {
  draft: { label: 'Nháp', className: 'bg-foreground text-text-secondary' },
  pending: {
    label: 'Chờ duyệt',
    className: 'bg-warning-background text-warning-text-on-subtle',
  },
  upcoming: {
    label: 'Sắp diễn ra',
    className: 'bg-success-background text-success-text-on-subtle',
  },
  ongoing: {
    label: 'Đang diễn ra',
    className: 'bg-info-background text-info-text-on-subtle',
  },
  completed: {
    label: 'Đã kết thúc',
    className: 'bg-foreground text-text-secondary',
  },
  rejected: {
    label: 'Bị từ chối',
    className: 'bg-destructive-background text-destructive-text-on-subtle',
  },
  cancelled: {
    label: 'Đã hủy',
    className: 'bg-destructive-background text-destructive-text-on-subtle',
  },
};

export default function MyEventCard({ event }) {
  const navigate = useNavigate();
  const statusInfo = statusStyles[event.status] || {
    label: 'Không xác định',
    className: 'bg-foreground text-text-secondary',
  };

  const actionLinks = [
    { label: 'Tổng quan', path: `/manage/${event.id}/dashboard` },
    { label: 'Đơn hàng', path: `/manage/${event.id}/orders` },
    { label: 'Check-in', path: `/manage/${event.id}/checkin` },
  ];

  const handleCardClick = () => {
    navigate(`/manage/${event.id}/dashboard`);
  };

  return (
    <div className="border-border-default bg-background-secondary relative rounded-lg border shadow-sm transition-shadow hover:shadow-md">
      <div
        className={`absolute top-4 right-0 rounded-l-md px-3 py-1 text-xs font-semibold shadow-sm ${statusInfo.className} `}
      >
        {statusInfo.label}
      </div>

      <div
        onClick={handleCardClick}
        className="flex cursor-pointer flex-col p-4 sm:flex-row sm:p-6"
      >
        <div className="bg-foreground mb-4 h-40 w-full flex-shrink-0 overflow-hidden rounded-md sm:mb-0 sm:h-40 sm:w-40">
          <img
            src={event.bannerImageUrl}
            className="h-full w-full object-cover"
            alt={event.name}
          />
        </div>

        <div className="flex flex-1 flex-col sm:ml-6">
          <h3 className="text-text-primary hover:text-primary mt-2 text-lg leading-tight font-bold md:pr-20">
            {event.name}
          </h3>

          <div className="text-text-secondary mt-2 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>
                {new Date(event.startDate).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>
                {event.format === 'offline'
                  ? event.location.address || event.location.province.name
                  : 'Sự kiện online'}
              </span>
            </div>
          </div>

          <div className="border-border-subtle mt-4 flex items-center space-x-6 border-t pt-4">
            <div>
              <p className="text-text-secondary text-xs">Vé đã bán</p>
              <p className="text-text-primary font-semibold">
                {event?.totalTicketsSold} / {event?.totalTicketsAvailable}
              </p>
            </div>
            <div>
              {/* <p className="text-text-secondary text-xs">Doanh thu</p>
              <p className="text-text-primary font-semibold">123,456,000 đ</p> */}
            </div>
          </div>
        </div>
      </div>

      <div className="border-border-default bg-foreground/50 flex items-center justify-around border-t px-4 py-2">
        {actionLinks.map((link, index) => (
          <React.Fragment key={link.path}>
            <Link
              to={link.path}
              onClick={(e) => e.stopPropagation()}
              className="text-text-secondary hover:bg-foreground hover:text-primary cursor-pointer rounded-md px-3 py-1 text-sm font-semibold transition-colors"
            >
              {link.label}
            </Link>
            {index < actionLinks.length - 1 && (
              <div className="bg-border-default h-4 w-px"></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
