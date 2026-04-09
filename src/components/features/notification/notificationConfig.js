export const ROLE_NOTIFICATION_FILTERS = {
  admin: [
    { key: 'all', label: 'Tất cả' },
    { key: 'reports', label: 'Báo cáo' },
    { key: 'events', label: 'Sự kiện' },
    { key: 'users', label: 'Người dùng' },
    { key: 'payments', label: 'Thanh toán' },
    { key: 'critical', label: 'Critical' },
  ],
  organizer: [
    { key: 'all', label: 'Tất cả' },
    { key: 'events', label: 'Sự kiện' },
    { key: 'orders', label: 'Đơn hàng' },
    { key: 'community', label: 'Cộng đồng' },
    { key: 'account', label: 'Tài khoản' },
  ],
  customer: [
    { key: 'all', label: 'Tất cả' },
    { key: 'orders', label: 'Đơn hàng' },
    { key: 'events', label: 'Sự kiện' },
    { key: 'community', label: 'Cộng đồng' },
    { key: 'account', label: 'Tài khoản' },
  ],
};

export const getRoleNotificationFilters = (role = 'customer') => {
  if (role === 'admin') return ROLE_NOTIFICATION_FILTERS.admin;
  if (role === 'organizer') return ROLE_NOTIFICATION_FILTERS.organizer;
  return ROLE_NOTIFICATION_FILTERS.customer;
};
