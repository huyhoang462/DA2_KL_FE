import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  LayoutGrid,
  BarChart2,
  TicketCheck,
  UserCog,
  Pencil,
} from 'lucide-react';
import Sidebar from '../shared/SideBar';
import MobileHeader from '../shared/MobileHeader';

const dorganizerNavItems = [
  { name: 'Tạo sự kiện mới', path: '/organizer/create-event', icon: Pencil },
  { name: 'Sự kiện của tôi', path: '/organizer/my-events', icon: LayoutGrid },
  {
    name: 'Tài khoản Check-in',
    path: '/organizer/checkin-accounts',
    icon: TicketCheck,
  },
  // {
  //   name: 'Phân tích tổng quan',
  //   path: '/organizer/analytics',
  //   icon: BarChart2,
  // },
  // { name: 'Cài đặt tài khoản', path: '/organizer/settings', icon: UserCog },
];

const OrganizerLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar
        navigationItems={dorganizerNavItems}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />
      <div className="flex flex-col">
        <MobileHeader setMobileOpen={setMobileSidebarOpen} />
        <main className="bg-background-primary flex flex-1 flex-col gap-4 p-4 md:pt-0 lg:gap-6 lg:p-6 lg:pt-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default OrganizerLayout;
