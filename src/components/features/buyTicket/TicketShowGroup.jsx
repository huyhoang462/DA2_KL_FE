import React from 'react';
import TicketTypeCard from './TicketTypeCard';

export default function TicketShowGroup({ show }) {
  return (
    <div className="border-border-default bg-background-secondary rounded-lg border shadow-sm">
      <div className="border-border-default border-b p-4">
        <h2 className="text-text-primary font-semibold">{show.name}</h2>
        <p className="text-text-secondary text-sm"></p>
      </div>
      <div>
        {show.tickets.map((ticket) => (
          <TicketTypeCard key={ticket._id} ticket={ticket} />
        ))}
      </div>
    </div>
  );
}
