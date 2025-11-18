import React, { useState } from 'react';
import { Outlet, useParams, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Ticket,
  ChevronRight,
  CalendarDays,
} from 'lucide-react';
import Sidebar from '../shared/SideBar';
import MobileHeader from '../shared/MobileHeader';

const Breadcrumbs = ({ eventName }) => (
  <nav className="text-text-secondary hidden items-center space-x-2 text-sm md:flex">
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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const event = { name: 'Đại nhạc hội Mùa hè 2024' };

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

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar
        navigationItems={eventNavItems}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />
      <div className="flex flex-col">
        <header className="bg-background-secondary hidden h-14 items-center gap-4 border-b px-4 md:flex lg:h-[60px] lg:px-6">
          <Breadcrumbs eventName={event?.name} />
          <div className="ml-auto flex items-center gap-4">
            <div className="h-8 w-8 cursor-pointer rounded-full bg-gray-600"></div>
          </div>
        </header>

        <MobileHeader setMobileOpen={setMobileSidebarOpen} />

        <main className="bg-background-primary flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
