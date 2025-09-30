// src/layouts/DashboardLayout.jsx
import React from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { PlusSquare, LayoutGrid, BarChart2, User, LogOut } from 'lucide-react';
// Component Sidebar nội bộ
const DashboardSidebar = () => {
  const navItems = [
    { name: 'Sự kiện của tôi', path: '/dashboard/my-events', icon: LayoutGrid },
    { name: 'Phân tích', path: '/dashboard/analytics', icon: BarChart2 },
  ];

  const baseClasses =
    'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white hover:bg-gray-700';
  const activeClasses = 'bg-gray-800 text-white';

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r border-gray-800 bg-gray-900 sm:flex">
      <nav className="flex flex-col gap-2 p-4">
        <div className="mb-4">
          <Link to="/" className="text-2xl font-bold text-white">
            ShineTicket
          </Link>
          <p className="text-xs text-gray-400">Kênh Nhà tổ chức</p>
        </div>

        <Link
          to="/dashboard/create-event"
          className="bg-primary hover:bg-primary/90 mb-4 flex items-center justify-center gap-2 rounded-md py-2 font-semibold text-white"
        >
          <PlusSquare className="h-5 w-5" />
          Tạo sự kiện mới
        </Link>

        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end // Dùng `end` cho các link không phải là cha
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      {/* User menu ở cuối sidebar */}
      <div className="mt-auto border-t border-gray-800 p-4">
        {/* Tạm thời, sau sẽ là component riêng */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gray-600"></div>
          <div>
            <p className="text-sm font-semibold text-white">Tên User</p>
            <p className="text-xs text-gray-400">user@email.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default function DashboardLayout() {
  return (
    <div className="grid min-h-screen w-full sm:grid-cols-[256px_1fr]">
      <DashboardSidebar />
      <div className="flex flex-col sm:pl-64">
        {/* Header cho Dashboard có thể thêm ở đây nếu cần, ví dụ cho mobile */}
        <main className="flex-1 bg-gray-950 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
