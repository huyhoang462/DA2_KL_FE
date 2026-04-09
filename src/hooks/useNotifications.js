import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  getNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../services/notificationService';
import {
  matchesNotificationFilter,
  normalizeNotification,
} from '../utils/notification';

export const useNotifications = ({
  role = 'customer',
  pageSize = 20,
  pollInterval = 20000,
  autoLoadList = false,
  initialFilter = 'all',
} = {}) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState(initialFilter);

  const [loadingList, setLoadingList] = useState(false);
  const [loadingCount, setLoadingCount] = useState(false);
  const [listError, setListError] = useState('');
  const [countError, setCountError] = useState('');
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const hasLoadedOnceRef = useRef(false);

  const loadUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    setLoadingCount(true);
    setCountError('');

    try {
      const payload = await getUnreadNotificationsCount();
      setUnreadCount(Number(payload?.data?.unreadCount || 0));
    } catch (error) {
      setCountError(error?.message || 'Không tải được số thông báo chưa đọc.');
    } finally {
      setLoadingCount(false);
    }
  }, [isAuthenticated]);

  const loadNotifications = useCallback(
    async ({ targetPage = 1, append = false } = {}) => {
      if (!isAuthenticated) {
        setNotifications([]);
        setPage(1);
        setHasMore(false);
        return;
      }

      setLoadingList(true);
      setListError('');

      try {
        const payload = await getNotifications({
          page: targetPage,
          limit: pageSize,
        });

        const items = Array.isArray(payload?.data)
          ? payload.data.map(normalizeNotification)
          : [];

        setNotifications((prev) => {
          if (!append) {
            return items;
          }

          const seen = new Set(prev.map((item) => item.id));
          const merged = [...prev];

          items.forEach((item) => {
            if (!seen.has(item.id)) {
              merged.push(item);
            }
          });

          return merged;
        });

        const pagination = payload?.pagination || {};
        setHasMore(Boolean(pagination.hasNextPage));
        setPage(Number(pagination.page || targetPage));
        hasLoadedOnceRef.current = true;
      } catch (error) {
        setListError(error?.message || 'Không tải được danh sách thông báo.');
      } finally {
        setLoadingList(false);
      }
    },
    [isAuthenticated, pageSize]
  );

  const ensureNotificationsLoaded = useCallback(async () => {
    if (!hasLoadedOnceRef.current) {
      await loadNotifications({ targetPage: 1, append: false });
    }
  }, [loadNotifications]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingList) return;
    await loadNotifications({ targetPage: page + 1, append: true });
  }, [hasMore, loadingList, loadNotifications, page]);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      loadUnreadCount(),
      loadNotifications({ targetPage: 1, append: false }),
    ]);
  }, [loadNotifications, loadUnreadCount]);

  const markOneAsRead = useCallback(
    async (notificationId) => {
      if (!notificationId) return;

      const current = notifications.find((item) => item.id === notificationId);
      if (!current || current.isRead) return;

      await markNotificationAsRead(notificationId);

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId
            ? {
                ...item,
                isRead: true,
                readAt: new Date().toISOString(),
              }
            : item
        )
      );

      setUnreadCount((prev) => Math.max(0, Number(prev) - 1));
    },
    [notifications]
  );

  const markAllAsRead = useCallback(async () => {
    if (isMarkingAllRead) return;

    setIsMarkingAllRead(true);
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
          readAt: item.readAt || new Date().toISOString(),
        }))
      );
      setUnreadCount(0);
    } finally {
      setIsMarkingAllRead(false);
    }
  }, [isMarkingAllRead]);

  useEffect(() => {
    if (!isAuthenticated) return;

    loadUnreadCount();
    if (autoLoadList) {
      loadNotifications({ targetPage: 1, append: false });
    }
  }, [autoLoadList, isAuthenticated, loadNotifications, loadUnreadCount]);

  useEffect(() => {
    if (!isAuthenticated || !pollInterval) return undefined;

    const timer = window.setInterval(() => {
      loadUnreadCount();
    }, pollInterval);

    return () => window.clearInterval(timer);
  }, [isAuthenticated, loadUnreadCount, pollInterval]);

  const filteredNotifications = useMemo(() => {
    return notifications
      .filter((item) => matchesNotificationFilter(item, activeFilter, role))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [activeFilter, notifications, role]);

  return {
    notifications,
    filteredNotifications,
    unreadCount,
    activeFilter,
    loadingList,
    loadingCount,
    listError,
    countError,
    isMarkingAllRead,
    hasMore,
    page,
    setActiveFilter,
    loadUnreadCount,
    loadNotifications,
    ensureNotificationsLoaded,
    loadMore,
    refreshAll,
    markOneAsRead,
    markAllAsRead,
    isAuthenticated,
  };
};
