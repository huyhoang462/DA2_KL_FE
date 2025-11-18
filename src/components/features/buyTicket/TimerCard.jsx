// src/pages/payment/partials/TimerCard.jsx
import React from 'react';

const TimeBox = ({ value }) => (
  <div className="bg-foreground flex h-16 w-16 flex-col items-center justify-center rounded-lg shadow-inner sm:h-20 sm:w-20">
    <span className="text-text-primary text-2xl font-bold sm:text-3xl">
      {String(value).padStart(2, '0')}
    </span>
  </div>
);

export default function TimerCard({ minutes, seconds }) {
  return (
    <div className="border-border-default bg-background-secondary rounded-lg border p-6 text-center">
      <h2 className="text-text-secondary text-sm font-semibold sm:text-base">
        Thời gian giữ vé còn lại
      </h2>
      <div className="my-4 flex items-center justify-center space-x-2 sm:space-x-4">
        <TimeBox value={minutes} />
        <span className="text-text-secondary text-2xl font-bold sm:text-3xl">
          :
        </span>
        <TimeBox value={seconds} />
      </div>
      <p className="text-text-secondary text-xs sm:text-sm">
        Vui lòng hoàn tất thanh toán trong thời gian này để đảm bảo vé của bạn.
      </p>
    </div>
  );
}
