import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { cn } from '../../utils/lib';
import { X } from 'lucide-react';

export default function Sidebar({
  navigationItems,
  mobileOpen,
  setMobileOpen,
}) {
  const baseLinkClasses =
    'flex items-center gap-3 rounded-lg px-3 py-2 mb-1 text-text-secondary transition-all hover:text-text-primary hover:bg-primary';
  const activeLinkClasses = 'bg-primary text-text-primary shadow-sm';

  const sidebarContent = (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="border-border-subtle flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <img src="/favicon.ico" className="h-8" alt="Logo" />
          <span className="">Organizer</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path.split('/').length <= 3}
              className={({ isActive }) =>
                cn(baseLinkClasses, isActive && activeLinkClasses)
              }
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );

  return (
    <>
      <aside className="border-border-default bg-background-primary hidden border-r md:sticky md:top-0 md:block md:h-screen md:overflow-auto">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
        ></div>
      )}
      <aside
        className={cn(
          'bg-background-primary fixed inset-y-0 left-0 z-50 h-screen w-4/5 max-w-xs transform transition-transform duration-300 ease-in-out md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-hidden={!mobileOpen}
      >
        {sidebarContent}
        <button
          onClick={() => setMobileOpen(false)}
          className="text-text-secondary hover:text-text-primary hover:bg-foreground absolute top-4 right-4 cursor-pointer rounded-full p-1"
        >
          <X className="h-6 w-6" />
        </button>
      </aside>
    </>
  );
}
