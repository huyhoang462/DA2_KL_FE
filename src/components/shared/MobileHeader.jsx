/* eslint-disable no-unused-vars */
import React from 'react';
import { Menu, User } from 'lucide-react';

export default function MobileHeader({
  setMobileOpen,
  pageTitle,
  breadcrumbs,
}) {
  return (
    <header className="bg-background-secondary border-border-default flex h-14 items-center gap-4 border-b px-4 md:hidden lg:h-[60px] lg:px-6">
      <button className="cursor-pointer" onClick={() => setMobileOpen(true)}>
        <Menu className="h-6 w-6" />
        <span className="sr-only">Menu</span>
      </button>
      <div className="flex-1">
        {/* Có thể hiển thị breadcrumbs hoặc page title ở đây trên mobile */}
      </div>
      {/* Menu Avatar */}
      <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border">
        <User className="h-6" />
      </div>
    </header>
  );
}
