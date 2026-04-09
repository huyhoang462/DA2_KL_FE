import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useNotifications } from '../../hooks/useNotifications';
import useClickOutside from '../../hooks/useClickOutside';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Shield,
  BarChart3,
  UserCheck,
  CreditCard,
} from 'lucide-react';
import NotificationBell from '../features/notification/NotificationBell';
import NotificationDropdown from '../features/notification/NotificationDropdown';
import { getNotificationTargetPath } from '../../utils/notification';
import { toast } from 'react-toastify';
import { useAppLogout } from '../../hooks/useAppLogout';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const navigate = useNavigate();
  const appLogout = useAppLogout();
  const user = useSelector((state) => state.auth.user);
  const notificationRef = useClickOutside(() => setNotificationOpen(false));

  const {
    notifications,
    unreadCount,
    loadingList,
    loadingCount,
    listError,
    hasMore,
    ensureNotificationsLoaded,
    loadMore,
    refreshAll,
    markOneAsRead,
    markAllAsRead,
    isMarkingAllRead,
  } = useNotifications({
    role: 'admin',
    autoLoadList: false,
  });

  const handleLogout = async () => {
    await appLogout({
      onAfterClearAuth: () => {
        navigate('/login');
      },
    });
  };

  const menuItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
    },
    {
      label: 'Quản lý người dùng',
      icon: Users,
      path: '/admin/users',
    },
    {
      label: 'Quản lý sự kiện',
      icon: Calendar,
      path: '/admin/events',
    },
    // {
    //   label: 'Duyệt sự kiện',
    //   icon: UserCheck,
    //   path: '/admin/event-approvals',
    // },
    {
      label: 'Báo cáo & Thống kê',
      icon: BarChart3,
      path: '/admin/reports',
    },
    {
      label: 'Giao dịch',
      icon: CreditCard,
      path: '/admin/transactions',
    },
    // {
    //   label: 'Danh mục',
    //   icon: FileText,
    //   path: '/admin/categories',
    // },
    // {
    //   label: 'Cài đặt',
    //   icon: Settings,
    //   path: '/admin/settings',
    // },
  ];

  const SidebarItem = ({ item }) => (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'
        }`
      }
      onClick={() => setSidebarOpen(false)}
    >
      <item.icon className="h-5 w-5 flex-shrink-0" />
      <span>{item.label}</span>
    </NavLink>
  );

  return (
    <div className="bg-background-primary flex h-screen">
      {/* Sidebar */}
      <aside
        className={`bg-background-secondary border-border-default fixed inset-y-0 left-0 z-50 w-72 transform border-r transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="border-border-default flex h-16 items-center justify-between border-b px-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
                <Shield className="text-primary-foreground h-5 w-5" />
              </div>
              <div>
                <h1 className="text-text-primary text-lg font-bold">
                  Admin Panel
                </h1>
                <p className="text-text-secondary text-xs">
                  ShineTicket Management
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-text-secondary hover:text-text-primary lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4">
            {menuItems.map((item) => (
              <SidebarItem key={item.path} item={item} />
            ))}
          </nav>

          {/* User info */}
          <div className="border-border-default border-t p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-full">
                <span className="text-primary-foreground text-sm font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-text-primary truncate text-sm font-medium">
                  {user?.name || 'Admin User'}
                </p>
                <p className="text-text-secondary truncate text-xs">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="bg-background-secondary border-border-default flex h-16 items-center justify-between border-b px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-text-secondary hover:text-text-primary lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Search */}
            {/* <div className="hidden md:block">
              <div className="relative">
                <Search className="text-text-placeholder absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="border-border-default bg-background-primary text-text-primary placeholder:text-text-placeholder focus:border-primary focus:ring-primary/20 w-80 rounded-lg border py-2 pr-4 pl-9 text-sm focus:ring-2 focus:outline-none"
                />
              </div>
            </div> */}
          </div>

          <div className="flex items-center gap-4">
            <div ref={notificationRef} className="relative">
              <NotificationBell
                unreadCount={unreadCount}
                loading={loadingCount}
                isOpen={notificationOpen}
                onClick={async () => {
                  const nextOpen = !notificationOpen;
                  setNotificationOpen(nextOpen);
                  if (nextOpen) {
                    await ensureNotificationsLoaded();
                  }
                }}
              />

              {notificationOpen && (
                <NotificationDropdown
                  notifications={notifications.slice(0, 8)}
                  unreadCount={unreadCount}
                  loading={loadingList}
                  error={listError}
                  onRefresh={refreshAll}
                  onMarkAllAsRead={markAllAsRead}
                  isMarkingAllRead={isMarkingAllRead}
                  hasMore={hasMore}
                  onLoadMore={loadMore}
                  onItemClick={async (item) => {
                    try {
                      if (!item.isRead) {
                        await markOneAsRead(item.id);
                      }
                    } catch (error) {
                      toast.error(
                        error?.message ||
                          'Không thể cập nhật trạng thái thông báo.'
                      );
                    }

                    setNotificationOpen(false);
                    navigate(getNotificationTargetPath(item, 'admin'));
                  }}
                />
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="hover:bg-background-primary flex items-center gap-2 rounded-lg px-3 py-2 transition-colors"
              >
                <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full">
                  <span className="text-primary-foreground text-sm font-semibold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <ChevronDown className="text-text-secondary h-4 w-4" />
              </button>

              {profileDropdownOpen && (
                <div className="bg-background-secondary border-border-default absolute top-full right-0 z-50 mt-2 w-48 rounded-lg border shadow-lg">
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="text-destructive hover:bg-destructive/10 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm"
                    >
                      <LogOut className="h-4 w-4" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto px-6 py-4 lg:px-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
