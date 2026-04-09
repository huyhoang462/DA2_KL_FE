import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../ui/Button';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { useNotifications } from '../../../hooks/useNotifications';
import { getNotificationTargetPath } from '../../../utils/notification';
import { getRoleNotificationFilters } from './notificationConfig';
import NotificationFilterTabs from './NotificationFilterTabs';
import NotificationItem from './NotificationItem';
import NotificationEmptyState from './NotificationEmptyState';
import NotificationSkeleton from './NotificationSkeleton';
import { toast } from 'react-toastify';
import { RefreshCcw } from 'lucide-react';

const roleTitle = {
  admin: 'System Notifications',
  organizer: 'Thông báo Organizer',
  customer: 'Thông báo của bạn',
};

const NotificationCenterPage = ({ role = 'customer' }) => {
  const navigate = useNavigate();
  const tabs = getRoleNotificationFilters(role);

  const {
    filteredNotifications,
    unreadCount,
    activeFilter,
    loadingList,
    listError,
    hasMore,
    setActiveFilter,
    loadMore,
    refreshAll,
    markOneAsRead,
  } = useNotifications({
    role,
    autoLoadList: true,
    initialFilter: tabs[0]?.key || 'all',
  });

  const handleItemClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await markOneAsRead(notification.id);
      }
    } catch (error) {
      toast.error(error?.message || 'Không thể cập nhật trạng thái thông báo.');
    }

    navigate(getNotificationTargetPath(notification, role));
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      <div className="bg-background-secondary border-border-default rounded-2xl border p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-text-primary text-xl font-bold">
              {roleTitle[role] || roleTitle.customer}
            </h1>
            <p className="text-text-secondary mt-1 text-sm">
              {unreadCount} thông báo chưa đọc
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshAll}
              className="text-text-secondary hover:text-text-primary rounded p-1"
              aria-label="Làm mới"
            >
              <RefreshCcw className="h-6 w-6" />
            </button>
            {/* <Button
              variant="primary"
              onClick={markAllAsRead}
              loading={isMarkingAllRead}
              disabled={unreadCount === 0}
            >
              Đánh dấu tất cả đã đọc
            </Button> */}
          </div>
        </div>

        <NotificationFilterTabs
          tabs={tabs}
          activeKey={activeFilter}
          onChange={setActiveFilter}
          className="mt-4"
        />
      </div>

      {loadingList ? (
        <div className="space-y-3">
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
        </div>
      ) : listError ? (
        <div className="bg-destructive-background text-destructive rounded-xl px-4 py-3 text-sm">
          {listError}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-background-secondary border-border-default rounded-2xl border">
          <NotificationEmptyState
            title="Không có thông báo nào"
            message="Hãy thử chuyển bộ lọc hoặc quay lại sau."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((item) => (
            <NotificationItem
              key={item.id}
              item={item}
              onClick={handleItemClick}
            />
          ))}

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button variant="secondary" onClick={loadMore}>
                {loadingList ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" /> Đang tải
                  </>
                ) : (
                  'Xem thêm'
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenterPage;
