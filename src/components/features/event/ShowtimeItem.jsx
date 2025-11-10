import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import { Plus, Trash2 } from 'lucide-react';
import TicketTypeFormModal from './TicketTypeFormModal';
import ConfirmModal from '../../ui/ConfirmModal';
import {
  updateShowtimeField,
  removeShowtime,
  addTicketToShowtime,
  updateTicketInShowtime,
  removeTicketFromShowtime,
} from '../../../store/slices/eventSlice';

const TicketTypePill = ({ ticket, onEdit, onRemove }) => (
  <div className="bg-background-secondary border-border-default flex items-center justify-between rounded-md border p-2 pl-4">
    <div>
      <p className="text-text-primary font-semibold">{ticket.name}</p>
      <p className="text-text-secondary text-sm">
        {new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(ticket.price)}{' '}
        - SL: {ticket.quantityTotal}
      </p>
    </div>
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" onClick={onEdit}>
        Sửa
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
        onClick={onRemove}
      >
        Xóa
      </Button>
    </div>
  </div>
);

export default function ShowtimeItem({
  showData,
  showIndex,
  errors,
  onChange,
}) {
  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingTicket, setEditingTicket] = useState(null);
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    type: null,
    data: null,
  });

  const handleShowtimeChange = (fieldName, value) => {
    onChange(fieldName);
    dispatch(updateShowtimeField({ showIndex, field: fieldName, value }));
  };

  const handleRemoveShow = () => {
    setConfirmState({
      isOpen: true,
      type: 'removeShow',
      data: null,
    });
  };

  const handleAddTicketClick = () => {
    setEditingTicket(null);
    setIsModalOpen(true);
  };

  const handleEditTicketClick = (ticket) => {
    setEditingTicket(ticket);
    setIsModalOpen(true);
  };

  const handleRemoveTicket = (ticketId) => {
    setConfirmState({
      isOpen: true,
      type: 'removeTicket',
      data: { ticketId },
    });
  };

  const onConfirmAction = () => {
    if (confirmState.type === 'removeShow') {
      dispatch(removeShowtime(showIndex));
    } else if (confirmState.type === 'removeTicket') {
      dispatch(
        removeTicketFromShowtime({
          showIndex,
          ticketId: confirmState.data.ticketId,
        })
      );
    }
  };
  const onCancelConfirm = () => {
    setConfirmState({ isOpen: false, type: null, data: null });
  };

  const handleSaveTicket = (ticketData) => {
    if (editingTicket) {
      dispatch(
        updateTicketInShowtime({
          showIndex,
          ticketId: editingTicket._id,
          ticketData,
        })
      );
    } else {
      dispatch(addTicketToShowtime({ showIndex, ticketData }));
    }
    setIsModalOpen(false);
  };

  return (
    <div className="border-border-default bg-background-secondary rounded-lg border p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Input
          id={`eventShowName-${showIndex}`}
          label="Tên suất diễn"
          placeholder="Ví dụ: Suất chiếu tối"
          value={showData.name}
          onChange={(e) => handleShowtimeChange('name', e.target.value)}
          error={errors.name}
        />
        <Input
          id={`eventShowStart-${showIndex}`}
          label="Thời gian bắt đầu"
          type="datetime-local"
          value={showData.startTime}
          onChange={(e) => handleShowtimeChange('startTime', e.target.value)}
          error={errors.startTime}
        />
        <Input
          id={`eventShowEnd-${showIndex}`}
          label="Thời gian kết thúc"
          type="datetime-local"
          value={showData.endTime}
          onChange={(e) => handleShowtimeChange('endTime', e.target.value)}
          error={errors.endTime}
        />
      </div>

      <div className="mt-6">
        <h4 className="text-text-primary mb-2 font-semibold">Các loại vé</h4>
        {showData.tickets.length === 0 && errors.tickets_general && (
          <p className="text-destructive mb-2 text-sm">
            {errors.tickets_general}
          </p>
        )}
        <div className="space-y-3">
          {showData.tickets?.map((ticket, ticketIndex) => (
            <TicketTypePill
              key={ticket._id || ticketIndex}
              ticket={ticket}
              onEdit={() => handleEditTicketClick(ticket)}
              onRemove={() => handleRemoveTicket(ticket._id)}
            />
          ))}
        </div>
      </div>

      <div className="border-border-subtle mt-6 flex items-center justify-between border-t pt-6">
        <Button
          variant="outline"
          className="text-destructive hover:text-destructive"
          onClick={handleRemoveShow}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Xóa suất diễn
        </Button>
        <Button onClick={handleAddTicketClick}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm loại vé
        </Button>
      </div>

      <TicketTypeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTicket}
        initialData={editingTicket}
      />
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onCancel={onCancelConfirm}
        onConfirm={onConfirmAction}
        title={
          confirmState.type === 'removeShow' ? 'Xóa suất diễn?' : 'Xóa loại vé?'
        }
        message={
          confirmState.type === 'removeShow'
            ? 'Hành động này không thể hoàn tác. Tất cả các loại vé trong suất diễn này cũng sẽ bị xóa.'
            : 'Bạn có chắc chắn muốn xóa loại vé này không?'
        }
      />
    </div>
  );
}
