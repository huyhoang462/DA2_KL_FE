// src/layouts/AccountLayout.jsx
import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Header from '../shared/Header';
// Component NavTabs nội bộ
const AccountNavTabs = () => {
  const navItems = [
    { name: 'Vé của tôi', path: '/user/tickets' },
    { name: 'Lịch sử đơn hàng', path: '/user/orders' },
    { name: 'Hồ sơ', path: '/user/profile' },
  ];

  const baseClasses =
    'py-2 px-4 text-sm font-medium border-b-2 transition-colors';
  const inactiveClasses =
    'border-transparent text-gray-400 hover:text-white hover:border-gray-500';
  const activeClasses = 'border-primary text-white';

  return (
    <nav className="flex space-x-4">
      {navItems.map((item) => (
        <NavLink key={item.name} to={item.path}>
          {item.name}
        </NavLink>
      ))}
    </nav>
  );
};

const AccountLayout = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header variant="account" />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold">Tài khoản của tôi</h1>
          <AccountNavTabs />
        </div>
        <div>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
export default AccountLayout;
