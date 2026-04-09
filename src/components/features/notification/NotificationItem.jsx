import React from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  MessageCircle,
  Receipt,
  ShieldAlert,
} from 'lucide-react';

const priorityStyles = {
  critical: 'border-l-destructive',
  high: 'border-l-warning',
  medium: 'border-l-info',
  low: 'border-l-border-default',
};

const getIconByType = (type) => {
  if (type?.startsWith('payment_')) return Receipt;
  if (type?.startsWith('event_')) return Calendar;
  if (type === 'comment_reply') return MessageCircle;
  if (type === 'report_reviewed') return ShieldAlert;
  if (type?.startsWith('account_')) return AlertTriangle;
  return CheckCircle2;
};

const formatTimeAgo = (value) => {
  if (!value) return 'Không rõ thời gian';

  const date = new Date(value);
  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffSeconds < 60) return 'Vừa xong';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} phút trước`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} giờ trước`;
  if (diffSeconds < 604800)
    return `${Math.floor(diffSeconds / 86400)} ngày trước`;

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const NotificationItem = ({ item, onClick }) => {
  const Icon = getIconByType(item.type);
  const priority = (item.priority || 'medium').toLowerCase();

  return (
    <button
      onClick={() => onClick(item)}
      className={`border-border-default bg-background-secondary hover:bg-foreground w-full rounded-xl border border-l-4 p-3 text-left transition ${
        priorityStyles[priority] || priorityStyles.medium
      } ${item.isRead ? 'opacity-80' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className="bg-foreground mt-0.5 rounded-full p-2">
          <Icon className="text-text-primary h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between gap-2">
            <p
              className={`truncate text-sm ${
                item.isRead
                  ? 'text-text-secondary font-medium'
                  : 'text-text-primary font-semibold'
              }`}
            >
              {item.title}
            </p>
            {!item.isRead && (
              <span className="bg-primary h-2 w-2 rounded-full" />
            )}
          </div>

          <p className="text-text-secondary line-clamp-1 text-xs">
            {item.message}
          </p>
          <p className="text-text-secondary mt-1.5 text-[11px]">
            {formatTimeAgo(item.createdAt)}
          </p>
        </div>
      </div>
    </button>
  );
};

export default NotificationItem;
