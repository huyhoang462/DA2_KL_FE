import React from 'react';
import { RefreshCcw } from 'lucide-react';
import Button from '../../ui/Button';
import NotificationItem from './NotificationItem';
import NotificationSkeleton from './NotificationSkeleton';
import NotificationEmptyState from './NotificationEmptyState';

const NotificationDropdown = ({
  notifications = [],
  unreadCount = 0,
  loading = false,
  error = '',
  onRefresh,
  onItemClick,
  onMarkAllAsRead,
  isMarkingAllRead = false,
  onLoadMore,
  hasMore = false,
}) => {
  return (
    <div className="bg-background-secondary border-border-default absolute top-12 right-0 z-50 w-[360px] rounded-xl border shadow-xl">
      <div className="border-border-default flex items-center justify-between border-b px-4 py-3">
        <div>
          <p className="text-text-primary text-sm font-semibold">Thông báo</p>
          <p className="text-text-secondary text-xs">{unreadCount} chưa đọc</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="text-text-secondary hover:text-text-primary rounded p-1"
            aria-label="Làm mới"
          >
            <RefreshCcw className="h-4 w-4" />
          </button>

          <Button
            variant="secondary"
            className="px-2 py-1 text-xs"
            onClick={onMarkAllAsRead}
            loading={isMarkingAllRead}
            disabled={unreadCount === 0}
          >
            Đọc hết
          </Button>
        </div>
      </div>

      <div className="max-h-[420px] space-y-2 overflow-y-auto p-3">
        {loading && (
          <>
            <NotificationSkeleton />
            <NotificationSkeleton />
            <NotificationSkeleton />
          </>
        )}

        {!loading && error && (
          <div className="bg-destructive-background text-destructive rounded-lg px-3 py-2 text-xs">
            {error}
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <NotificationEmptyState />
        )}

        {!loading &&
          !error &&
          notifications.map((item) => (
            <NotificationItem key={item.id} item={item} onClick={onItemClick} />
          ))}

        {!loading && hasMore && (
          <Button variant="secondary" className="w-full" onClick={onLoadMore}>
            Xem thêm
          </Button>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
