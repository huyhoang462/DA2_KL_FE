// src/layouts/EventLayout.jsx
import React, { useState } from 'react';
import { Outlet, useParams, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Ticket,
  Settings,
  ChevronRight,
} from 'lucide-react';
import Sidebar from '../components/shared/Sidebar';
import MobileHeader from '../components/shared/MobileHeader';

// Giả sử có một hook hoặc hàm để fetch thông tin sự kiện
// const { event, isLoading } = useEvent(eventId);

// Component Breadcrumbs
const Breadcrumbs = ({ eventName }) => (
  <nav className="text-text-secondary hidden items-center space-x-2 text-sm md:flex">
    <Link to="/dashboard/my-events" className="hover:text-text-primary">
      Sự kiện của tôi
    </Link>
    <ChevronRight className="h-4 w-4" />
    <span className="text-text-primary font-semibold">
      {eventName || 'Đang tải...'}
    </span>
  </nav>
);

export default function EventLayout() {
  const { eventId } = useParams();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Dữ liệu giả, sau này sẽ fetch từ API
  const event = { name: 'Đại nhạc hội Mùa hè 2024' };

  // Định nghĩa menu cho không gian chi tiết sự kiện
  const eventNavItems = [
    {
      name: 'Dashboard',
      path: `/manage/event/${eventId}`,
      icon: LayoutDashboard,
    },
    { name: 'Đơn hàng', path: `/manage/event/${eventId}/orders`, icon: Ticket },
    {
      name: 'Người tham dự',
      path: `/manage/event/${eventId}/attendees`,
      icon: Users,
    },
    {
      name: 'Cài đặt sự kiện',
      path: `/manage/event/${eventId}/settings`,
      icon: Settings,
    },
  ];

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar
        navigationItems={eventNavItems}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />
      <div className="flex flex-col">
        {/* Header cho Desktop sẽ được tích hợp vào đây */}
        <header className="bg-background-secondary hidden h-14 items-center gap-4 border-b px-4 md:flex lg:h-[60px] lg:px-6">
          <Breadcrumbs eventName={event?.name} />
          <div className="ml-auto flex items-center gap-4">
            {/* Thêm các nút hành động nhanh ở đây, ví dụ: "Xem trang sự kiện" */}
            <div className="h-8 w-8 cursor-pointer rounded-full bg-gray-600"></div>
          </div>
        </header>

        {/* Header cho Mobile */}
        <MobileHeader setMobileOpen={setMobileSidebarOpen} />

        <main className="bg-background-primary flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
