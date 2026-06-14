// src/components/features/buyTicket/CartSummary.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Tag } from 'lucide-react';
import Button from '../../../components/ui/Button';
import useCartSummary from '../../../hooks/useCartSummary';
import useUsdtVndRate from '../../../hooks/useUsdtVndRate';
import PriceDisplay from '../../ui/PriceDisplay';

export default function CartSummary({ event, selectedShow }) {
  const navigate = useNavigate();
  const { summaryItems, totalAmount, totalQuantity, validationError } =
    useCartSummary(event);
  const { data: exchangeRateVndPerUsdt } = useUsdtVndRate();

  const handleCheckout = () => {
    if (validationError) {
      alert(validationError);
      return;
    }
    navigate(`/payment/${event.id}/${selectedShow?._id}`);
  };

  return (
    <div className="border-border-default bg-background-secondary overflow-hidden rounded-2xl border shadow-sm">
      {/* Header */}
      <div className="border-border-default flex items-center gap-3 border-b px-5 py-4">
        <div className="bg-primary/20 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl">
          <ShoppingCart className="text-primary h-4.5 w-4.5" />
        </div>
        <div>
          <h2 className="text-text-primary text-base font-bold">Đơn hàng</h2>
          <p className="text-text-secondary text-xs">
            {totalQuantity > 0 ? `${totalQuantity} vé đã chọn` : 'Chưa chọn vé'}
          </p>
        </div>
      </div>

      {/* Item list */}
      <div className="px-5 py-4">
        {summaryItems.length > 0 ? (
          <div className="max-h-60 space-y-3 overflow-y-auto">
            {summaryItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3"
              >
                {/* Left: name + qty badge */}
                <div className="flex min-w-0 items-start gap-2">
                  <div className="bg-primary/20 mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md">
                    <Tag className="text-primary h-3 w-3" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-text-primary truncate text-sm font-semibold">
                      {item.name}
                    </p>
                    <span className="text-text-secondary text-xs">
                      x{item.quantity}
                    </span>
                  </div>
                </div>

                {/* Right: subtotal */}
                <div className="flex-shrink-0 text-right">
                  <PriceDisplay
                    amountUsdt={item.subtotal}
                    rateVndPerUsdt={exchangeRateVndPerUsdt}
                    layout="stacked"
                    containerClassName="items-end"
                    usdtClassName="text-text-primary text-sm font-bold"
                    vndClassName="text-text-secondary text-xs font-medium"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="bg-foreground mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl">
              <ShoppingCart className="text-text-secondary h-5 w-5" />
            </div>
            <p className="text-text-secondary text-sm">
              Chưa có vé nào được chọn.
            </p>
            <p className="text-text-placeholder mt-0.5 text-xs">
              Chọn loại vé bên trái để thêm vào đơn
            </p>
          </div>
        )}
      </div>

      {/* Total + CTA */}
      <div className="border-border-subtle border-t px-5 pt-4 pb-5">
        {/* Validation error */}
        {validationError && (
          <div className="bg-destructive-background text-destructive mb-3 rounded-lg px-3 py-2 text-center text-xs font-medium">
            {validationError}
          </div>
        )}

        {/* Total row */}
        {totalQuantity > 0 && (
          <div className="mb-4 flex items-center justify-between">
            <span className="text-text-primary text-sm font-bold">
              Tổng cộng
            </span>
            <PriceDisplay
              amountUsdt={totalAmount}
              rateVndPerUsdt={exchangeRateVndPerUsdt}
              layout="stacked"
              containerClassName="items-end"
              usdtClassName="text-primary text-lg font-black"
              vndClassName="text-text-secondary text-xs font-medium"
            />
          </div>
        )}

        <Button
          className="w-full"
          size="lg"
          variant={
            totalQuantity === 0 || !!validationError ? 'disabled' : 'default'
          }
          disabled={totalQuantity === 0 || !!validationError}
          onClick={handleCheckout}
        >
          Tiếp tục thanh toán
        </Button>
      </div>
    </div>
  );
}
