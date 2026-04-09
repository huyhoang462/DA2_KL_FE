import React from 'react';
import { Bell } from 'lucide-react';

const NotificationBell = ({
  unreadCount = 0,
  loading = false,
  isOpen = false,
  onClick,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      className={`text-text-primary hover:text-text-primary hover:bg-foreground relative rounded-lg p-2 transition ${className}`}
      aria-label="Mở thông báo"
    >
      <Bell className="h-5 w-5" />
      {!loading && unreadCount > 0 && (
        <span className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 min-w-5 rounded-full px-1 text-center text-[10px] leading-5 font-semibold">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
      {isOpen && (
        <span className="bg-primary absolute right-2 -bottom-1 h-1.5 w-1.5 rounded-full" />
      )}
    </button>
  );
};

export default NotificationBell;
