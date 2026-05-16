import React from 'react';
import { cn } from '../../utils/lib';
import { formatUsdtAmount, formatVndAmount } from '../../utils/currency';

/**
 * PriceDisplay
 * - Renders USDT as primary value
 * - Optionally renders VND conversion using the provided rate
 * - Supports inline (same row) or stacked (two rows) layouts
 */
export default function PriceDisplay({
  prefix,
  amountUsdt,
  rateVndPerUsdt,
  layout = 'inline', // 'inline' | 'stacked'
  stackedVndAlign = 'value', // 'value' | 'start' (only meaningful when layout='stacked' and prefix is provided)
  showVnd = true,
  emptyText = '-',
  freeText = 'Miễn phí',
  vndWrapper = 'paren', // 'paren' | 'plain'
  vndPrefix = '~',
  containerClassName,
  prefixClassName,
  usdtClassName,
  vndClassName,
  freeClassName,
}) {
  const usdtValue = Number(amountUsdt);

  if (!Number.isFinite(usdtValue)) {
    return <span className={containerClassName}>{emptyText}</span>;
  }

  if (usdtValue === 0) {
    return (
      <span className={cn('text-text-secondary', freeClassName)}>
        {freeText}
      </span>
    );
  }

  const rateValue = Number(rateVndPerUsdt);
  const canShowVnd = showVnd && Number.isFinite(rateValue) && rateValue > 0;
  const vndValue = canShowVnd ? usdtValue * rateValue : null;

  const isStacked = layout === 'stacked';
  const hasPrefix = prefix !== undefined && prefix !== null && prefix !== '';

  const containerStyles = isStacked
    ? hasPrefix
      ? 'inline-grid grid-cols-[auto_1fr] items-start leading-tight gap-x-1'
      : 'inline-flex flex-col items-start leading-tight'
    : 'inline-flex items-baseline gap-1';

  const usdtText = `${formatUsdtAmount(usdtValue)} USDT`;

  const vndText =
    vndValue === null ? null : `${vndPrefix}${formatVndAmount(vndValue)} VND`;

  const vndRendered =
    vndText === null ? null : vndWrapper === 'paren' ? `${vndText}` : vndText;

  return (
    <span className={cn(containerStyles, containerClassName)}>
      {hasPrefix && (
        <span
          className={cn(
            prefixClassName,
            isStacked && hasPrefix ? 'col-start-1 row-start-1' : null
          )}
        >
          {prefix}
        </span>
      )}
      <span
        className={cn(
          'text-primary font-semibold',
          usdtClassName,
          isStacked && hasPrefix ? 'col-start-2 row-start-1' : null
        )}
      >
        {usdtText}
      </span>
      {vndRendered && (
        <span
          className={cn(
            'text-text-secondary text-xs',
            vndClassName,
            isStacked && hasPrefix
              ? stackedVndAlign === 'start'
                ? 'col-span-2 col-start-1 row-start-2'
                : 'col-start-2 row-start-2'
              : null
          )}
        >
          {vndRendered}
        </span>
      )}
    </span>
  );
}
