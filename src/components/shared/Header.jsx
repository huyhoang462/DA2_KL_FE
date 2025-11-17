import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Menu,
  UserIcon,
  ChevronDown,
  LogOut,
  Ticket,
  User,
  Calendar,
  PlusCircle,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import useClickOutside from '../../hooks/useClickOutside';
import { logout } from '../../store/slices/authSlice';

const Header = () => {
  const auth = useSelector((state) => state.auth);
  const isLoggedIn = auth.isAuthenticated;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useClickOutside(() => setDropdownOpen(false));
  const mobileMenuRef = useClickOutside(() => setMobileMenuOpen(false));
  const nav = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    setDropdownOpen(false);
    nav('/');
  };

  const userMenuItems = [
    {
      label: 'Thông tin tài khoản',
      icon: <User className="mr-2 h-4 w-4" />,
      onClick: () => {
        nav('/user/profile');
        setDropdownOpen(false);
      },
    },
    {
      label: 'Vé của tôi',
      icon: <Ticket className="mr-2 h-4 w-4" />,
      onClick: () => {
        nav('/user/tickets');
        setDropdownOpen(false);
      },
    },
    {
      label: 'Sự kiện của tôi',
      icon: <Calendar className="mr-2 h-4 w-4" />,
      onClick: () => {
        nav('/organizer/my-events');
        setDropdownOpen(false);
      },
    },
    {
      label: 'Đăng xuất',
      icon: <LogOut className="mr-2 h-4 w-4" />,
      onClick: handleLogout,
      className:
        'text-destructive hover:bg-destructive-background font-semibold',
    },
  ];

  const renderUserDropdown = () => (
    <div
      ref={dropdownRef}
      className="animate-fade-in border-border-default bg-background-secondary ring-border-default absolute top-12 right-0 z-50 w-56 rounded-xl border py-2 shadow-lg ring-1"
    >
      <div className="border-border-default border-b px-4 py-2">
        <div className="text-text-primary font-semibold">
          {auth.user?.fullName || 'Tài khoản'}
        </div>
        <div className="text-text-secondary text-xs">{auth.user?.email}</div>
      </div>
      <ul className="py-1">
        {userMenuItems.map((item) => (
          <li
            key={item.label}
            className={`flex cursor-pointer items-center px-4 py-2 text-sm transition ${
              item.className || 'hover:bg-primary/20'
            }`}
            onClick={item.onClick}
          >
            {item.icon}
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );

  const renderRightContent = () => {
    if (!isLoggedIn) {
      return (
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="text-text-primary hover:bg-primary/10 hover:text-primary flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition"
          >
            <LogIn className="h-5 w-5" />
            Đăng nhập
          </Link>
          <Link
            to="/signup"
            className="text-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition"
          >
            <UserPlus className="h-5 w-5" />
            Đăng ký
          </Link>
        </div>
      );
    }

    return (
      <div className="relative flex h-8 items-center gap-4">
        <Link
          to="/organizer/create-event"
          className="hover:bg-background-secondary text-background-primary hover:text-primary flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Tổ chức sự kiện</span>
        </Link>
        <div
          className="relative flex cursor-pointer items-center select-none"
          onClick={() => setDropdownOpen((v) => !v)}
        >
          <UserIcon
            size={18}
            className="text-primary-foreground bg-background-secondary h-8 w-8 rounded-full p-1 shadow"
          />
          <ChevronDown size={18} className="text-primary-foreground ml-1" />
          {dropdownOpen && renderUserDropdown()}
        </div>
      </div>
    );
  };

  const renderMobileMenu = () => (
    <div
      ref={mobileMenuRef}
      className="fixed inset-0 z-50 flex justify-end bg-black/40"
      style={{ animation: 'fadeIn .2s' }}
    >
      <div className="border-border-default bg-background-secondary flex h-full w-64 flex-col border-l px-4 py-6 shadow-2xl">
        <button
          className="text-text-secondary hover:text-primary mb-4 self-end"
          onClick={() => setMobileMenuOpen(false)}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <nav className="flex flex-col gap-2">
          <Link
            to="/"
            className="text-primary hover:bg-primary/10 cursor-pointer rounded-lg px-3 py-2 text-lg font-bold transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            Trang chủ
          </Link>

          {!isLoggedIn ? (
            <>
              <Link
                to="/login"
                className="text-text-primary hover:bg-primary/10 hover:text-primary flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-base font-medium transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LogIn className="h-5 w-5" />
                Đăng nhập
              </Link>
              <Link
                to="/signup"
                className="text-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-base font-medium transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserPlus className="h-5 w-5" />
                Đăng ký
              </Link>
            </>
          ) : (
            <>
              <button
                className="border-primary bg-background-secondary text-primary hover:bg-primary hover:text-primary-foreground flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-base font-medium transition"
                onClick={() => {
                  nav('/organizer/create-event');
                  setMobileMenuOpen(false);
                }}
              >
                <PlusCircle className="h-5 w-5" />
                Tổ chức sự kiện
              </button>
              {userMenuItems.slice(0, -1).map((item) => (
                <button
                  key={item.label}
                  className="text-text-primary hover:bg-primary/10 flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-base font-medium transition"
                  onClick={() => {
                    item.onClick();
                    setMobileMenuOpen(false);
                  }}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
              <button
                className="text-destructive hover:bg-destructive-background flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-base font-medium transition"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </button>
            </>
          )}
        </nav>
      </div>
    </div>
  );

  return (
    <header className="bg-primary fixed top-0 left-0 z-50 w-full shadow transition-all duration-300">
      <div className="h-hheader bg-primary container mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="text-primary-foreground hover:text-primary-hover flex items-center gap-2 text-xl font-bold transition"
        >
          <img src="/Logo.png" className="h-12" />
        </Link>

        <div className="relative hidden md:block">
          <Search className="text-text-placeholder absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm sự kiện..."
            className="border-border-default bg-background-secondary text-text-primary placeholder-text-placeholder focus:border-primary focus:ring-primary w-64 rounded-full border py-2 pr-4 pl-10 transition focus:ring-2 focus:outline-none lg:w-96"
          />
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {renderRightContent()}
        </div>

        <div className="md:hidden">
          <Menu
            className="text-primary-foreground h-7 w-7 cursor-pointer"
            onClick={() => setMobileMenuOpen(true)}
          />
        </div>
      </div>
      {mobileMenuOpen && renderMobileMenu()}
    </header>
  );
};

export default Header;
