import React from 'react';
import QRCode from 'react-qr-code';
import { X } from 'lucide-react';
export default function TicketModal({ isOpen, onClose, ticket }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-sm rounded-lg bg-background-secondary p-8 text-center" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary">
          <X className="h-6 w-6" />
        </button>
        <h3 className="text-xl font-bold text-text-primary">{ticket.eventName}</h3>
        <p className="text-sm text-primary mb-4">{ticket.ticketTypeName}</p>
        
        <div className="mx-auto mt-6 max-w-[200px] rounded-lg bg-white p-4">
          <QRCode value={ticket.qrCode} size={256} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
        </div>
        
        <p className="mt-4 text-xs text-text-secondary">Đưa mã này cho nhân viên check-in</p>
        <p className="mt-1 font-mono text-sm text-text-primary tracking-widest">{ticket.qrCode}</p>
      </div>
    </div>
  );
}