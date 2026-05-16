// src/pages/checkout/partials/CartSummary.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import useCartSummary from '../../../hooks/useCartSummary';
import useUsdtVndRate from '../../../hooks/useUsdtVndRate';
import PriceDisplay from '../../ui/PriceDisplay';

// import { toast } from 'react-hot-toast';

export default function CartSummary({ event, selectedShow }) {
  const navigate = useNavigate();
  const { summaryItems, totalAmount, totalQuantity, validationError } =
    useCartSummary(event);
  const { data: exchangeRateVndPerUsdt } = useUsdtVndRate();

  const handleCheckout = () => {
    if (validationError) {
      // toast.error(validationError);
      alert(validationError);
      return;
    }
    navigate(`/payment/${event.id}/${selectedShow?._id}`);
  };

  return (
    <div className="border-border-default bg-background-secondary rounded-lg border p-6 shadow-sm">
      <div className="space-y-4">
        <h2 className="text-text-primary text-lg font-bold">Đơn hàng</h2>

        <div className="max-h-60 space-y-2 overflow-y-auto pr-2">
          {summaryItems.length > 0 ? (
            <table className="w-full text-sm">
              <tbody>
                {summaryItems.map((item) => (
                  <tr key={item.id}>
                    <td className="text-text-primary py-2 text-left font-medium">
                      {item.name}{' '}
                      <span className="text-text-secondary">
                        x{item.quantity}
                      </span>
                    </td>
                    <td className="text-text-secondary py-2 text-right font-medium">
                      <PriceDisplay
                        amountUsdt={item.subtotal}
                        rateVndPerUsdt={exchangeRateVndPerUsdt}
                        layout="stacked"
                        containerClassName="justify-end"
                        usdtClassName="text-text-primary font-semibold"
                        vndClassName="text-text-secondary text-xs font-medium"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-text-secondary py-8 text-center text-sm">
              Chưa có vé nào được chọn.
            </p>
          )}
        </div>
      </div>

      <div className="border-border-subtle mt-4 space-y-4 border-t pt-4">
        {validationError && (
          <p className="text-destructive text-center text-xs">
            {validationError}
          </p>
        )}
        <div className="flex justify-between text-lg font-bold">
          <span className="text-text-primary">Tổng cộng</span>
          <span className="text-primary">
            <PriceDisplay
              amountUsdt={totalAmount}
              rateVndPerUsdt={exchangeRateVndPerUsdt}
              layout="stacked"
              usdtClassName="text-primary"
              vndClassName="text-text-secondary text-sm font-medium"
            />
          </span>
        </div>
        <Button
          className="w-full"
          size="lg"
          variant={
            totalQuantity === 0 || !!validationError ? 'disabled' : 'default'
          }
          disabled={totalQuantity === 0 || !!validationError}
          onClick={handleCheckout}
        >
          Tiếp tục
        </Button>
      </div>
    </div>
  );
}
