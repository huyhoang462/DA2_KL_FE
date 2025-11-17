import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { validateTicketType } from '../../../utils/validation';

export default function TicketTypeFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}) {
  const isEditing = !!initialData;
  const [modalErrors, setModalErrors] = useState({});
  const [ticket, setTicket] = useState({
    name: '',
    price: '',
    quantityTotal: '',
    minPurchase: 1,
    maxPurchase: 10,
  });

  useEffect(() => {
    if (isEditing) {
      setTicket(initialData);
    } else {
      setTicket({
        name: '',
        price: '',
        quantityTotal: '',
        minPurchase: 1,
        maxPurchase: 10,
      });
    }
  }, [initialData, isEditing, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setModalErrors((pre) => ({ ...pre, [name]: undefined }));
    const processedValue = [
      'price',
      'quantityTotal',
      'minPurchase',
      'maxPurchase',
    ].includes(name)
      ? parseInt(value, 10) || ''
      : value;
    setTicket((prev) => ({ ...prev, [name]: processedValue }));
  };

  const handleSave = () => {
    const validationErrors = validateTicketType(ticket);

    setModalErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onSave(ticket);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-10 bg-black/50" />
        <Dialog.Content className="border-border-default bg-background-secondary data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border p-6 shadow-lg duration-200 sm:rounded-lg">
          <Dialog.Title className="text-text-primary text-lg font-semibold">
            {isEditing ? 'Chỉnh sửa loại vé' : 'Thêm loại vé mới'}
          </Dialog.Title>

          {/* Form */}
          <div className="grid gap-4 py-4">
            <Input
              id="ticketTypeName"
              label="Tên loại vé"
              name="name"
              value={ticket.name}
              onChange={handleChange}
              placeholder="Ví dụ: Vé VIP"
              error={modalErrors.name}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="ticketTypePrice"
                label="Giá vé (VND)"
                name="price"
                type="number"
                value={ticket.price}
                onChange={handleChange}
                placeholder="500000"
                error={modalErrors.price}
              />
              <Input
                id="ticketTypeTotal"
                label="Tổng số lượng vé"
                name="quantityTotal"
                type="number"
                value={ticket.quantityTotal}
                onChange={handleChange}
                placeholder="100"
                error={modalErrors.quantityTotal}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="ticketTypeMin"
                label="Mua tối thiểu/đơn"
                name="minPurchase"
                type="number"
                value={ticket.minPurchase}
                onChange={handleChange}
                error={modalErrors.minPurchase}
              />
              <Input
                id="ticketTypeMax"
                label="Mua tối đa/đơn"
                name="maxPurchase"
                type="number"
                value={ticket.maxPurchase}
                onChange={handleChange}
                error={modalErrors.maxPurchase}
              />
            </div>
          </div>

          <Dialog.Close asChild>
            <button
              className="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>

          <div className="mt-4 flex justify-end gap-4">
            <Dialog.Close asChild>
              <Button type="button" variant="outline">
                Hủy
              </Button>
            </Dialog.Close>
            <Button type="button" onClick={handleSave}>
              Lưu thay đổi
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
