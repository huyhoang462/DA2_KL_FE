import React from 'react';
import { BellOff } from 'lucide-react';

const NotificationEmptyState = ({
  title = 'Chưa có thông báo',
  message = 'Bạn sẽ thấy thông báo mới tại đây.',
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl px-4 py-10 text-center">
      <BellOff className="text-text-secondary h-10 w-10" />
      <p className="text-text-primary mt-3 text-sm font-semibold">{title}</p>
      <p className="text-text-secondary mt-1 text-xs">{message}</p>
    </div>
  );
};

export default NotificationEmptyState;
