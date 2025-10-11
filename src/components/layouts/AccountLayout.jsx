import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Header from '../shared/Header';
import { Ticket, List, User } from 'lucide-react';

const navItems = [
  {
    name: 'Vé của tôi',
    path: '/user/tickets',
    icon: <Ticket className="h-5 w-5" />,
  },
  {
    name: 'Lịch sử đơn hàng',
    path: '/user/orders',
    icon: <List className="h-5 w-5" />,
  },
  { name: 'Hồ sơ', path: '/user/profile', icon: <User className="h-5 w-5" /> },
];

const AccountNavTabs = () => (
  <nav>
    <div className="bg-background-secondary border-border-default hidden h-full min-h-[400px] w-full flex-col gap-1 rounded-2xl border px-3 py-6 shadow md:flex">
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) =>
            [
              'flex items-center gap-3 rounded-lg px-4 py-3 text-base font-semibold transition duration-150',
              isActive
                ? 'bg-primary text-primary-foreground shadow'
                : 'text-text-secondary hover:bg-primary/10 hover:text-primary',
            ].join(' ')
          }
        >
          {item.icon}
          {item.name}
        </NavLink>
      ))}
    </div>
    <div className="bg-background-secondary border-border-default mb-4 flex gap-2 rounded-xl border px-2 py-2 shadow-sm md:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) =>
            [
              'flex flex-1 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-center text-xs font-semibold transition',
              isActive
                ? 'bg-primary text-primary-foreground shadow'
                : 'text-text-secondary hover:bg-primary/10 hover:text-primary',
            ].join(' ')
          }
        >
          {item.icon}
          <span>{item.name}</span>
        </NavLink>
      ))}
    </div>
  </nav>
);

const AccountLayout = () => {
  return (
    <div className="bg-background-primary text-text-primary flex h-screen flex-col">
      <Header variant="account" />
      <div className="mt-hheader flex-1 overflow-y-auto">
        <main className="container mx-auto flex flex-col gap-6 px-2 py-8 md:flex-row">
          {/* Sidebar tabs */}
          <aside className="relative flex flex-shrink-0 flex-col md:min-w-3xs">
            <div className="md:top-hheader min-w-3xs md:fixed md:mt-8">
              <AccountNavTabs />
            </div>
          </aside>
          <section className="w-full flex-1">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  );
};

export default AccountLayout;
