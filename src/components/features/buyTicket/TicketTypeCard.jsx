import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateTicketQuantity } from '../../../store/slices/cartSlice';
import Button from '../../../components/ui/Button';
import { Plus, Minus, Info } from 'lucide-react';

const QuantitySelector = ({ ticket, quantity, onQuantityChange }) => {
  const availableQuantity = ticket.quantityTotal - ticket.quantitySold;
  const maxAllowed = Math.min(ticket.maxPurchase, availableQuantity);

  return (
    <div className="flex items-center">
      <button
        onClick={() => onQuantityChange(-1)}
        disabled={quantity === 0}
        className="border-border-default hover:text-primary text-text-secondary hover:bg-foreground flex h-9 w-9 cursor-pointer items-center justify-center rounded-l-md border border-r-0 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="border-border-default text-text-primary flex h-9 w-12 items-center justify-center border-y text-center text-lg font-bold">
        {quantity}
      </span>
      <button
        onClick={() => onQuantityChange(1)}
        disabled={quantity >= maxAllowed}
        className="border-border-default text-text-secondary hover:text-primary hover:bg-foreground flex h-9 w-9 cursor-pointer items-center justify-center rounded-r-md border border-l-0 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
};

export default function TicketTypeCard({ ticket }) {
  const dispatch = useDispatch();
  const quantity = useSelector((state) => state.cart.items[ticket._id] || 0);

  const availableQuantity = ticket.quantityTotal - ticket.quantitySold;
  const maxAllowed = Math.min(ticket.maxPurchase, availableQuantity);

  const handleQuantityChange = (amount) => {
    let newQuantity = quantity + amount;

    newQuantity = Math.max(0, newQuantity);
    newQuantity = Math.min(newQuantity, maxAllowed);

    if (newQuantity !== quantity) {
      dispatch(
        updateTicketQuantity({
          ticketTypeId: ticket._id,
          quantity: newQuantity,
        })
      );
    }
  };

  const isSoldOut = availableQuantity <= 0;

  return (
    <div className="border-border-subtle flex flex-col gap-4 border-b p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1">
        <h3 className="text-text-primary font-bold">{ticket.name}</h3>
        <p className="text-primary mt-1 font-semibold">
          {ticket.price.toLocaleString()} VNĐ
        </p>
        {/*
        <p className="text-sm text-text-secondary mt-1">{ticket.description}</p>
        <div className="mt-2 flex items-center gap-2 text-xs text-text-secondary">
          <Info className="h-3 w-3" />
          <span>Mua tối thiểu {ticket.minPurchase}, tối đa {ticket.maxPurchase}.</span>
        </div>
        */}
      </div>

      <div className="flex-shrink-0">
        {isSoldOut ? (
          <span className="bg-destructive/10 text-destructive rounded-full px-3 py-1 text-sm font-semibold">
            Hết vé
          </span>
        ) : (
          <QuantitySelector
            ticket={ticket}
            quantity={quantity}
            onQuantityChange={handleQuantityChange}
          />
        )}
      </div>
    </div>
  );
}
