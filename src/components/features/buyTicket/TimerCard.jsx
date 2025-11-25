// src/pages/payment/partials/TimerCard.jsx

import React from 'react';
import { cn } from '../../../utils/lib'; // Giả sử đường dẫn đúng

// Component con cho mỗi hộp số, giúp tái sử dụng và code sạch hơn
const TimeBox = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div className="bg-primary flex h-20 w-20 items-center justify-center rounded-lg sm:h-24 sm:w-24">
      <span className="text-text-primary text-4xl font-bold tracking-wider tabular-nums sm:text-5xl">
        {String(value).padStart(2, '0')}
      </span>
    </div>
    <span className="text-text-secondary mt-2 text-xs font-medium tracking-widest uppercase">
      {label}
    </span>
  </div>
);

export default function TimerCard({ minutes, seconds }) {
  // Cảnh báo khi còn dưới 1 phút
  const isWarning = minutes < 1;

  return (
    <div className="flex items-start justify-center space-x-4">
      <TimeBox value={minutes} label="Phút" />

      <span
        className={cn(
          'pt-7 text-4xl font-bold transition-colors sm:pt-8 sm:text-5xl',
          isWarning ? 'text-destructive animate-pulse' : 'text-text-secondary'
        )}
      >
        :
      </span>

      <TimeBox value={seconds} label="Giây" />
    </div>
  );
}
