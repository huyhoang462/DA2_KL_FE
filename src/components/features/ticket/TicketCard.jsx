// TicketCard.jsx - Horizontal Layout

import React, { useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  MapPin,
  Calendar,
  Clock,
  QrCode,
  Globe,
  Building,
  Ticket,
} from 'lucide-react';

import Button from '../../ui/Button';
import Modal from '../../ui/Modal';

const STATUS_CONFIG = {
  pending: {
    label: 'Chưa sử dụng',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
  checkedIn: {
    label: 'Đã check-in',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  out: {
    label: 'Đã ra ngoài',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
  },
  expired: {
    label: 'Đã hết hạn',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
  },
  cancelled: {
    label: 'Đã hủy',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
  },
};

export default function TicketCard({ ticket }) {
  const [showQRModal, setShowQRModal] = useState(false);

  const statusConfig = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.pending;

  // Format ngày giờ
  const formattedDate = format(new Date(ticket.startTime), 'EEE, dd MMM yyyy', {
    locale: vi,
  });
  const formattedTime = `${format(new Date(ticket.startTime), 'HH:mm')} - ${format(
    new Date(ticket.endTime),
    'HH:mm'
  )}`;

  // Xác định icon location
  const isOnline = ticket.format === 'online';
  const LocationIcon = isOnline ? Globe : Building;

  return (
    <>
      {/* Horizontal Card Layout */}
      <div className="border-border-default bg-background-primary group overflow-hidden rounded-xl border transition-all hover:shadow-md">
        <div className="flex flex-col gap-4 p-4 md:flex-row">
          {/* Banner Image - Left Side */}
          <div className="relative h-32 w-full flex-shrink-0 overflow-hidden rounded-lg md:h-36 md:w-48">
            <img
              src={ticket.bannerImageUrl}
              alt={ticket.eventName}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Status Badge */}
            <div className="absolute top-2 right-2">
              <span
                className={`${statusConfig.bgColor} ${statusConfig.textColor} rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm`}
              >
                {statusConfig.label}
              </span>
            </div>
          </div>

          {/* Content - Right Side */}
          <div className="flex flex-1 flex-col justify-between gap-3">
            {/* Top Section: Event Info */}
            <div className="space-y-2">
              {/* Event Name */}
              <div>
                <h3 className="text-text-primary mb-0.5 line-clamp-1 text-base font-bold md:text-lg">
                  {ticket.eventName}
                </h3>
                <p className="text-text-secondary line-clamp-1 text-xs md:text-sm">
                  {ticket.showName}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {/* Date & Time */}
                <div className="flex items-center gap-2">
                  <Calendar className="text-primary h-4 w-4 flex-shrink-0" />
                  <div className="text-text-primary min-w-0 text-xs md:text-sm">
                    <p className="truncate font-medium">{formattedDate}</p>
                    <p className="text-text-secondary text-xs">
                      {formattedTime}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2">
                  <LocationIcon className="text-primary h-4 w-4 flex-shrink-0" />
                  <p className="text-text-primary line-clamp-2 min-w-0 text-xs md:text-sm">
                    {ticket.location ||
                      (isOnline ? 'Sự kiện trực tuyến' : 'Chưa có địa điểm')}
                  </p>
                </div>

                {/* Ticket Type */}
                <div className="flex items-center gap-2 md:col-span-2">
                  <Ticket className="text-primary h-4 w-4 flex-shrink-0" />
                  <p className="text-text-primary truncate text-xs font-medium md:text-sm">
                    {ticket.ticketTypeName}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Section: Action Button */}
            <div className="flex items-center justify-end">
              <Button
                onClick={() => setShowQRModal(true)}
                disabled={
                  ticket.status === 'cancelled' || ticket.status === 'expired'
                }
                className="w-full md:w-auto"
                variant="primary"
                size="sm"
              >
                <QrCode className="mr-2 h-4 w-4" />
                Xuất vé
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <Modal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          title="Mã QR Vé"
        >
          <div className="space-y-4 text-center">
            <div className="bg-background-secondary mx-auto flex h-64 w-64 items-center justify-center rounded-lg">
              {ticket.qrCode ? (
                <img
                  src={ticket.qrCode}
                  alt="QR Code"
                  className="h-full w-full object-contain p-4"
                />
              ) : (
                <p className="text-text-secondary">Chưa có mã QR</p>
              )}
            </div>
            <div className="text-text-secondary space-y-1 text-sm">
              <p className="font-semibold">{ticket.eventName}</p>
              <p>{ticket.showName}</p>
              <p>{ticket.ticketTypeName}</p>
            </div>
            <p className="text-text-tertiary text-xs">
              Vui lòng xuất trình mã QR này khi check-in tại sự kiện
            </p>
          </div>
        </Modal>
      )}
    </>
  );
}
