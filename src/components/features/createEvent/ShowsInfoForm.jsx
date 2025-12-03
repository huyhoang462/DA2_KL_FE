import React from 'react';

import Button from '../../ui/Button';
import { Plus } from 'lucide-react';
import ShowtimeItem from './ShowtimeItem';

export default function ShowsInfoForm({
  value: shows = [],
  onChange,
  errors,
  isEditable = true,
}) {
  const handleAddShowtime = () => {
    const newShow = {
      _id: `temp_${Date.now()}`,
      name: `Suất diễn ${shows.length + 1}`,
      startTime: '',
      endTime: '',
      tickets: [],
    };

    onChange('shows', [...shows, newShow]);
  };

  const handleRemoveShow = (showIndex) => {
    const newShows = shows.filter((_, i) => i !== showIndex);
    onChange('shows', newShows);
  };

  const handleAddTicket = (showIndex, ticketData) => {
    const newShows = JSON.parse(JSON.stringify(shows));
    newShows[showIndex].tickets.push({
      _id: `temp_ticket_${Date.now()}`,
      ...ticketData,
    });
    onChange('shows', newShows);
  };

  const handleUpdateTicket = (showIndex, ticketId, ticketData) => {
    const newShows = JSON.parse(JSON.stringify(shows));
    const ticketIndex = newShows[showIndex].tickets.findIndex(
      (t) => t._id === ticketId
    );
    if (ticketIndex !== -1) {
      newShows[showIndex].tickets[ticketIndex] = {
        ...newShows[showIndex].tickets[ticketIndex],
        ...ticketData,
      };
      onChange('shows', newShows);
    }
  };

  const handleRemoveTicket = (showIndex, ticketId) => {
    const newShows = JSON.parse(JSON.stringify(shows));
    newShows[showIndex].tickets = newShows[showIndex].tickets.filter(
      (t) => t._id !== ticketId
    );
    onChange('shows', newShows);
  };

  return (
    <div className="mx-auto space-y-8">
      {isEditable && (
        <div>
          <h2 className="text-text-primary text-lg leading-7 font-semibold">
            Lịch diễn & Vé
          </h2>
        </div>
      )}
      {errors.shows_general && (
        <p className="text-destructive text-center text-sm">
          {errors.shows_general}
        </p>
      )}
      <div className="space-y-6">
        {shows.length > 0 ? (
          shows.map((show, index) => (
            <ShowtimeItem
              key={show._id || index}
              showData={show}
              showIndex={index}
              onShowChange={(fieldName, value) =>
                onChange(`shows[${index}].${fieldName}`, value)
              }
              onRemoveShow={() => handleRemoveShow(index)}
              onAddTicket={(ticketData) => handleAddTicket(index, ticketData)}
              onUpdateTicket={(ticketId, ticketData) =>
                handleUpdateTicket(index, ticketId, ticketData)
              }
              onRemoveTicket={(ticketId) => handleRemoveTicket(index, ticketId)}
              errors={errors.shows?.[index] || {}}
              isEditable={isEditable}
            />
          ))
        ) : (
          <div className="border-border-default rounded-lg border-2 border-dashed py-12 text-center">
            <p className="text-text-secondary">Chưa có suất diễn nào.</p>
          </div>
        )}
        {isEditable && (
          <div className="w-full text-center">
            <Button type="button" onClick={handleAddShowtime}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm suất diễn
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
