export const NOTIFICATION_TYPES = {
  payment_success: 'payment_success',
  payment_failed: 'payment_failed',
  payment_cancelled: 'payment_cancelled',
  event_approved: 'event_approved',
  event_rejected: 'event_rejected',
  event_cancelled: 'event_cancelled',
  comment_reply: 'comment_reply',
  report_reviewed: 'report_reviewed',
  account_banned: 'account_banned',
  account_unbanned: 'account_unbanned',
};

const PAYMENT_TYPES = new Set([
  NOTIFICATION_TYPES.payment_success,
  NOTIFICATION_TYPES.payment_failed,
  NOTIFICATION_TYPES.payment_cancelled,
]);

const EVENT_TYPES = new Set([
  NOTIFICATION_TYPES.event_approved,
  NOTIFICATION_TYPES.event_rejected,
  NOTIFICATION_TYPES.event_cancelled,
]);

const COMMUNITY_TYPES = new Set([
  NOTIFICATION_TYPES.comment_reply,
  NOTIFICATION_TYPES.report_reviewed,
]);

const ACCOUNT_TYPES = new Set([
  NOTIFICATION_TYPES.account_banned,
  NOTIFICATION_TYPES.account_unbanned,
]);

const REPORT_TYPES = new Set([NOTIFICATION_TYPES.report_reviewed]);

const USER_TYPES = new Set([
  NOTIFICATION_TYPES.account_banned,
  NOTIFICATION_TYPES.account_unbanned,
]);

export const normalizeNotification = (item) => ({
  id: item.id || item._id,
  type: item.type || 'system',
  title: item.title || 'Thông báo',
  message: item.message || '',
  priority: item.priority || 'medium',
  channels: Array.isArray(item.channels) ? item.channels : ['in_app'],
  isRead: Boolean(item.isRead),
  readAt: item.readAt || null,
  metadata: item.metadata || {},
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

export const getNotificationGroup = (notification) => {
  const type = notification?.type;

  if (PAYMENT_TYPES.has(type)) return 'orders';
  if (EVENT_TYPES.has(type)) return 'events';
  if (COMMUNITY_TYPES.has(type)) return 'community';
  if (ACCOUNT_TYPES.has(type)) return 'account';

  return 'other';
};

export const matchesNotificationFilter = (
  notification,
  filterKey,
  role = 'customer'
) => {
  if (filterKey === 'all') return true;

  const priority = (notification.priority || '').toLowerCase();

  if (role === 'admin') {
    if (filterKey === 'critical') {
      return priority === 'critical';
    }

    if (filterKey === 'payments') {
      return PAYMENT_TYPES.has(notification.type);
    }

    if (filterKey === 'events') {
      return EVENT_TYPES.has(notification.type);
    }

    if (filterKey === 'reports') {
      return REPORT_TYPES.has(notification.type);
    }

    if (filterKey === 'users') {
      return USER_TYPES.has(notification.type);
    }
  }

  const group = getNotificationGroup(notification);

  if (filterKey === 'orders') return group === 'orders';
  if (filterKey === 'events') return group === 'events';
  if (filterKey === 'community') return group === 'community';
  if (filterKey === 'account') return group === 'account';

  return true;
};

export const getNotificationTargetPath = (notification, role = 'customer') => {
  const metadata = notification.metadata || {};
  const postQuery = metadata.postId ? `?post=${metadata.postId}` : '';

  if (PAYMENT_TYPES.has(notification.type)) {
    if (role === 'admin') {
      return metadata.orderId
        ? `/admin/transactions?orderId=${metadata.orderId}`
        : '/admin/transactions';
    }

    if (role === 'organizer') {
      return '/organizer/notifications';
    }

    return metadata.orderId
      ? `/user/orders?orderId=${metadata.orderId}`
      : '/user/orders';
  }

  if (EVENT_TYPES.has(notification.type)) {
    if (metadata.eventId) {
      if (role === 'admin') return `/admin/events/${metadata.eventId}`;
      if (role === 'organizer') return `/manage/${metadata.eventId}/detail`;
      return `/event-detail/${metadata.eventId}`;
    }

    if (role === 'admin') return '/admin/events';
    if (role === 'organizer') return '/organizer/my-events';
    return '/search';
  }

  if (notification.type === NOTIFICATION_TYPES.comment_reply) {
    if (role === 'organizer') {
      return `/organizer/posts${postQuery}`;
    }

    if (role === 'admin') {
      return '/admin/notifications';
    }

    return `/community${postQuery}`;
  }

  if (notification.type === NOTIFICATION_TYPES.report_reviewed) {
    if (role === 'admin') return '/admin/reports';
    if (role === 'organizer') return '/organizer/notifications';
    return '/notifications';
  }

  if (ACCOUNT_TYPES.has(notification.type)) {
    if (role === 'admin') return '/admin/users';
    if (role === 'organizer') return '/organizer/profile';
    return '/user/profile';
  }

  return role === 'admin'
    ? '/admin/notifications'
    : role === 'organizer'
      ? '/organizer/notifications'
      : '/notifications';
};
