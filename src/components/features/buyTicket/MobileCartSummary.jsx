// src/components/features/buyTicket/MobileCartSummary.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown, Tag } from 'lucide-react';
import Button from '../../../components/ui/Button';
import useCartSummary from '../../../hooks/useCartSummary';
import useUsdtVndRate from '../../../hooks/useUsdtVndRate';
import PriceDisplay from '../../ui/PriceDisplay';

export default function MobileCartSummary({ event, selectedShow }) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const { totalAmount, totalQuantity, validationError, summaryItems } =
    useCartSummary(event);
  const { data: exchangeRateVndPerUsdt } = useUsdtVndRate();

  // ── Fix: thêm navigate vào handleCheckout ──
  const handleCheckout = () => {
    if (validationError) {
      alert(validationError);
      return;
    }
    navigate(`/payment/${event.id}/${selectedShow?._id}`);
  };

  if (totalQuantity === 0) return null;

  return (
    <div className="border-border-default bg-background-secondary sticky bottom-0 z-10 w-full border-t shadow-[0_-4px_16px_rgba(0,0,0,0.08)] lg:hidden">
      {/* Expandable mini summary */}
      {isExpanded && (
        <div className="border-border-subtle max-h-52 overflow-y-auto border-b px-4 py-3">
          <div className="space-y-2.5">
            {summaryItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <div className="bg-primary-light flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md">
                    <Tag className="text-primary h-3 w-3" />
                  </div>
                  <span className="text-text-primary truncate text-sm font-medium">
                    {item.name}
                    <span className="text-text-secondary ml-1">
                      x{item.quantity}
                    </span>
                  </span>
                </div>
                <PriceDisplay
                  amountUsdt={item.subtotal}
                  rateVndPerUsdt={exchangeRateVndPerUsdt}
                  layout="stacked"
                  containerClassName="items-end flex-shrink-0"
                  usdtClassName="text-text-primary text-xs font-bold"
                  vndClassName="text-text-secondary text-[10px]"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main sticky bar */}
      <div className="px-4 py-3">
        {/* Validation error */}
        {validationError && (
          <p className="text-destructive mb-2 text-center text-xs font-medium">
            {validationError}
          </p>
        )}

        <div className="flex items-center justify-between gap-3">
          {/* Toggle + price info */}
          <button
            type="button"
            onClick={() => setIsExpanded((v) => !v)}
            className="hover:bg-foreground flex min-w-0 flex-1 items-center gap-2 rounded-xl p-1.5 transition"
            aria-expanded={isExpanded}
            aria-label={
              isExpanded ? 'Ẩn chi tiết đơn hàng' : 'Xem chi tiết đơn hàng'
            }
          >
            <div className="min-w-0">
              <p className="text-text-secondary text-left text-xs">
                {totalQuantity} vé đã chọn
              </p>
              <PriceDisplay
                amountUsdt={totalAmount}
                rateVndPerUsdt={exchangeRateVndPerUsdt}
                layout="inline"
                usdtClassName="text-primary text-base font-black"
                vndClassName="text-text-secondary text-xs font-medium"
              />
            </div>
            <div className="text-text-secondary ml-1 flex-shrink-0">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </div>
          </button>

          {/* CTA */}
          <Button
            onClick={handleCheckout}
            disabled={!!validationError}
            className="flex-shrink-0 px-6"
            size="lg"
          >
            Tiếp tục
          </Button>
        </div>
      </div>
    </div>
  );
}
