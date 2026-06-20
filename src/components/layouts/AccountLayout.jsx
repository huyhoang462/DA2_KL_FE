import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Header from '../shared/Header';
import { Ticket, List, User } from 'lucide-react';

const navItems = [
  {
    name: 'Vé của tôi',
    path: '/user/tickets',
    icon: Ticket,
  },
  {
    name: 'Lịch sử đơn hàng',
    path: '/user/orders',
    icon: List,
  },
  {
    name: 'Hồ sơ',
    path: '/user/profile',
    icon: User,
  },
];

const AccountNavSidebar = () => (
  <nav className="hidden md:block">
    <div className="bg-background-secondary border-border-default flex min-h-[400px] min-w-3xs flex-col gap-1 rounded-2xl border px-3 py-6 shadow-sm">
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
          {({ isActive }) => (
            <>
              <item.icon
                className={`h-5 w-5 flex-shrink-0 ${isActive ? 'opacity-100' : 'opacity-70'}`}
              />
              <span>{item.name}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  </nav>
);

// Bottom tab bar dành cho mobile
const AccountNavBottomBar = () => (
  <nav className="bg-background-secondary border-border-default fixed right-0 bottom-0 left-0 z-30 flex border-t px-2 py-1 shadow-lg md:hidden">
    {navItems.map((item) => (
      <NavLink
        key={item.name}
        to={item.path}
        className={({ isActive }) =>
          [
            'flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2 text-center transition-all duration-150',
            isActive
              ? 'text-primary'
              : 'text-text-secondary hover:text-primary',
          ].join(' ')
        }
      >
        {({ isActive }) => (
          <>
            <div
              className={`rounded-lg p-1.5 transition-colors ${isActive ? 'bg-primary/10' : ''}`}
            >
              <item.icon className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-semibold leading-tight">
              {item.name}
            </span>
          </>
        )}
      </NavLink>
    ))}
  </nav>
);

const AccountLayout = () => {
  return (
    <div className="bg-background-primary text-text-primary flex min-h-screen flex-col">
      <Header variant="account" />

      {/* Main content area - có padding-bottom trên mobile để tránh bị che bởi bottom nav */}
      <div className="mt-hheader flex-1 overflow-y-auto pb-20 md:pb-0">
        <main className="container mx-auto flex flex-col gap-6 px-3 py-6 md:flex-row md:items-start md:px-4 md:py-8">
          {/* Sidebar - desktop only, sticky */}
          <aside className="hidden flex-shrink-0 md:block">
            <div className="md:top-[calc(var(--header-height,64px)+2rem)] md:sticky">
              <AccountNavSidebar />
            </div>
          </aside>

          {/* Page content */}
          <section className="min-w-0 flex-1">
            <Outlet />
          </section>
        </main>
      </div>

      {/* Bottom nav bar - mobile only */}
      <AccountNavBottomBar />
    </div>
  );
};

export default AccountLayout;
