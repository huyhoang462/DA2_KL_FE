import React, { useState, useRef } from 'react';
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
        nav('/account');
        setDropdownOpen(false);
      },
    },
    {
      label: 'Vé của tôi',
      icon: <Ticket className="mr-2 h-4 w-4" />,
      onClick: () => {
        nav('/my-tickets');
        setDropdownOpen(false);
      },
    },
    {
      label: 'Sự kiện của tôi',
      icon: <Calendar className="mr-2 h-4 w-4" />,
      onClick: () => {
        nav('/my-events');
        setDropdownOpen(false);
      },
    },
    {
      label: 'Đăng xuất',
      icon: <LogOut className="mr-2 h-4 w-4" />,
      onClick: handleLogout,
      className: 'text-red-500 hover:bg-red-50',
    },
  ];

  const renderUserDropdown = () => (
    <div
      ref={dropdownRef}
      className="animate-fade-in absolute top-12 right-0 z-50 w-56 rounded-lg bg-white py-2 shadow-xl ring-1 ring-black/10"
    >
      <div className="border-b border-gray-100 px-4 py-2">
        <div className="font-semibold text-gray-800">
          {auth.user?.name || 'Tài khoản'}
        </div>
        <div className="text-xs text-gray-500">{auth.user?.email}</div>
      </div>
      <ul className="py-1">
        {userMenuItems.map((item) => (
          <li
            key={item.label}
            className={`flex cursor-pointer items-center px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100 ${item.className || ''}`}
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
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow hover:bg-gray-100"
          >
            Đăng nhập
          </Link>
          <Link
            to="/signup"
            className="bg-primary rounded-md px-4 py-2 text-sm font-semibold text-white shadow hover:bg-yellow-400 hover:text-gray-900"
          >
            Đăng ký
          </Link>
        </div>
      );
    }

    return (
      <div className="relative flex h-8 items-center gap-6">
        <Link
          to="/dashboard/create-event"
          className="hover:text-primary text-sm font-semibold"
        >
          Tổ chức sự kiện
        </Link>
        <div
          className="relative flex cursor-pointer items-center select-none"
          onClick={() => setDropdownOpen((v) => !v)}
        >
          <UserIcon
            size={28}
            className="h-8 w-8 rounded-full border-2 border-white p-1"
          />
          <ChevronDown size={18} className="ml-1 text-gray-700" />
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
      <div className="bg-primary flex h-full w-64 flex-col px-4 py-6 shadow-lg">
        <button
          className="hover:text-primary mb-4 self-end text-gray-500"
          onClick={() => setMobileMenuOpen(false)}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <nav className="flex flex-col gap-4">
          <Link
            to="/"
            className="text-primary text-lg font-bold"
            onClick={() => setMobileMenuOpen(false)}
          >
            Trang chủ
          </Link>

          {!isLoggedIn ? (
            <>
              <Link
                to="/login"
                className="text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Đăng nhập
              </Link>
              <Link
                to="/signup"
                className="text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Đăng ký
              </Link>
            </>
          ) : (
            <>
              {userMenuItems.slice(0, -1).map((item) => (
                <button
                  key={item.label}
                  className="flex items-center text-left text-base font-medium"
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
                className="flex items-center text-base font-medium text-red-500"
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
      <div className="h-hheader container mx-auto flex items-center justify-between px-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold text-white transition hover:text-yellow-400"
        >
          <img src="/Logo.png" className="h-12" />
        </Link>

        <div className="relative hidden md:block">
          <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm sự kiện..."
            className="focus:border-primary w-64 rounded-full border border-gray-700 bg-gray-800 py-2 pr-4 pl-10 text-white placeholder-gray-400 focus:outline-none lg:w-96"
          />
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {renderRightContent()}
        </div>

        <div className="md:hidden">
          <Menu
            className="h-7 w-7 cursor-pointer text-white"
            onClick={() => setMobileMenuOpen(true)}
          />
        </div>
      </div>
      {mobileMenuOpen && renderMobileMenu()}
    </header>
  );
};

export default Header;
