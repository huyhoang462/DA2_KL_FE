import React, { useState } from 'react';
import { Calendar, MapPin, QrCode } from 'lucide-react';
import  Button  from '../../../components/ui/Button';
import TicketModal from './TicketModal'; 

const statusStyles = {
  active: { text: 'Sắp diễn ra', className: 'bg-success/10 text-success-text-on-subtle' },
  checkedIn: { text: 'Đang diễn ra', className: 'bg-info/10 text-info-text-on-subtle' },
  temporarilyExited: { text: 'Đang diễn ra', className: 'bg-info/10 text-info-text-on-subtle' },
  consumed: { text: 'Đã kết thúc', className: 'bg-foreground text-text-secondary' },
  expired: { text: 'Đã kết thúc', className: 'bg-foreground text-text-secondary' },
};

export default function TicketCard({ ticket }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const statusInfo = statusStyles[ticket.status] || { text: 'Không xác định', className: 'bg-foreground text-text-secondary' };
  return (
    <>
    <div className="flex w-full overflow-hidden rounded-xl border border-border-default bg-background shadow-sm transition-all hover:shadow-lg">
  <div className="hidden w-32 flex-shrink-0 sm:block relative">
    <img
      src={ticket.eventBanner}
      alt={ticket.eventName}
      className="h-full w-full object-cover"
    />
    <div className="absolute inset-0 bg-black/10"></div>
  </div>

  <div className="flex flex-1 flex-col justify-between p-4">
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-primary">{ticket.ticketTypeName}</p>
        <span className={`rounded-full px-3 py-0.5 text-xs font-medium border ${statusInfo.className}`}>
          {statusInfo.text}
        </span>
      </div>

      <h3 className="text-lg font-bold text-text-primary leading-tight">
        {ticket.eventName}
      </h3>

      <div className="space-y-1 text-sm text-text-secondary">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5" />
          <span>{new Date(ticket.showtime).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5" />
          <span>{ticket.location}</span>
        </div>
      </div>
    </div>

    <div className="mt-4 flex items-end justify-between">
      <div>
        <p className="text-xs text-text-secondary">Giá vé</p>
        <p className="text-base font-semibold text-text-primary">
          {ticket.price.toLocaleString()} VNĐ
        </p>
      </div>

      {ticket.status === 'active' && (
        <Button size="sm" className="shadow-sm hover:shadow-md" onClick={() => setIsModalOpen(true)}>
          <QrCode className="mr-2 h-4 w-4" />
          Xuất vé
        </Button>
      )}
    </div>
  </div>
</div>


      <TicketModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        ticket={ticket} 
      />
    </>
  );
}