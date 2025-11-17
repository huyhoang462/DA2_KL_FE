import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import useCartSummary from '../../../hooks/useCartSummary';

export default function MobileCartSummary({ event }) {
  const navigate = useNavigate();

  const { totalAmount, totalQuantity, validationError, summaryItems } =
    useCartSummary(event);

  const handleCheckout = () => {
    if (validationError) {
      alert(validationError);
      return;
    }

    console.log('Proceed to checkout with:', {
      items: summaryItems,
      total: totalAmount,
      event,
    });
  };

  if (totalQuantity === 0) {
    return null;
  }

  return (
    <div className="border-border-default bg-background-secondary sticky bottom-0 z-10 w-full border-t p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.1)] lg:hidden">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-text-secondary text-sm">{totalQuantity} vé</p>
          <p className="text-primary text-lg font-bold">
            {totalAmount.toLocaleString()} VNĐ
          </p>
        </div>
        <Button
          onClick={handleCheckout}
          disabled={!!validationError}
          className="flex-shrink-0 px-6"
          size="lg"
        >
          Tiếp tục
        </Button>
      </div>
      {validationError && (
        <p className="text-destructive mt-2 text-center text-xs">
          {validationError}
        </p>
      )}
    </div>
  );
}
