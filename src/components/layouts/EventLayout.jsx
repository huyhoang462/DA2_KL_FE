import React, { useState } from 'react';
import {
  Outlet,
  useParams,
  Link,
  NavLink,
  useNavigate,
} from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Users,
  Ticket,
  ChevronRight,
  CalendarDays,
  Menu,
  X,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getEventById } from '../../services/eventService';
import { useAppLogout } from '../../hooks/useAppLogout';

const Breadcrumbs = ({ eventName }) => (
  <nav className="text-text-secondary flex items-center space-x-2 text-sm">
    <Link to="/organizer/my-events" className="hover:text-text-primary">
      Sự kiện của tôi
    </Link>
    <ChevronRight className="h-4 w-4" />
    <span className="text-text-primary font-semibold">
      {eventName || 'Đang tải...'}
    </span>
  </nav>
);

export default function EventLayout() {
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const appLogout = useAppLogout();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = async () => {
    await appLogout({
      onAfterClearAuth: () => {
        navigate('/login');
      },
    });
  };

  const { data: event } = useQuery({
    queryKey: ['eventDetail', id],
    queryFn: () => getEventById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  const eventNavItems = [
    {
      name: 'Tổng quan',
      path: `/manage/${id}/dashboard`,
      icon: LayoutDashboard,
    },
    { name: 'Đơn hàng', path: `/manage/${id}/orders`, icon: Ticket },
    {
      name: 'Check-in',
      path: `/manage/${id}/checkin`,
      icon: Users,
    },
    {
      name: 'Chi tiết sự kiện',
      path: `/manage/${id}/detail`,
      icon: CalendarDays,
    },
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
      <span>{item.name}</span>
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
                <CalendarDays className="text-primary-foreground h-5 w-5" />
              </div>
              <div>
                <h1 className="text-text-primary text-lg font-bold">
                  Event Manager
                </h1>
                <p className="text-text-secondary text-xs">
                  {event?.name || 'Loading...'}
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
            {eventNavItems.map((item) => (
              <SidebarItem key={item.path} item={item} />
            ))}
          </nav>

          {/* User info */}
          <div className="border-border-default border-t p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-full">
                <span className="text-primary-foreground text-sm font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'O'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-text-primary truncate text-sm font-medium">
                  {user?.name || 'Organizer'}
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
            <Breadcrumbs eventName={event?.name} />
          </div>

          <div className="flex items-center gap-4">
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="hover:bg-background-primary flex items-center gap-2 rounded-lg px-3 py-2 transition-colors"
              >
                <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full">
                  <span className="text-primary-foreground text-sm font-semibold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'O'}
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
}
