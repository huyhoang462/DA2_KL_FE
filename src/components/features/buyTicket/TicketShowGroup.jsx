// src/components/features/buyTicket/TicketShowGroup.jsx
import React from 'react';
import { Ticket } from 'lucide-react';
import TicketTypeCard from './TicketTypeCard';

export default function TicketShowGroup({ show }) {
  return (
    <div className="border-border-default bg-background-secondary overflow-hidden rounded-2xl border shadow-sm">
      {/* Group header */}
      <div className="border-border-default flex items-center gap-3 border-b px-5 py-4">
        <div className="bg-primary/20 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl">
          <Ticket className="text-primary h-4.5 w-4.5" />
        </div>
        <div>
          <h2 className="text-text-primary text-base font-bold">{show.name}</h2>
          <p className="text-text-secondary text-xs">
            {show.tickets?.length || 0} loại vé
          </p>
        </div>
      </div>

      {/* Ticket type list — divider between items */}
      <div className="divide-border-default divide-y">
        {show.tickets.map((ticket) => (
          <TicketTypeCard key={ticket._id} ticket={ticket} />
        ))}
      </div>
    </div>
  );
}
