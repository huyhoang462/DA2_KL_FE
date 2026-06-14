// src/components/layouts/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-[var(--color-footer-bg)]">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Cột 1: Thông tin thương hiệu */}
          <div className="flex flex-col space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/favicon.ico"
                alt="ShineTicket Logo"
                className="h-8 w-8 rounded bg-white p-0.5"
              />
              <span className="text-xl font-black tracking-tight text-[var(--color-footer-text-primary)]">
                Shine<span className="text-[var(--color-primary)]">Ticket</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-[var(--color-footer-text-secondary)]">
              Nền tảng phân phối và trao đổi vé sự kiện an toàn, minh bạch bằng
              công nghệ Blockchain & NFT.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a
                href="#"
                className="text-[var(--color-footer-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-[var(--color-footer-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-[var(--color-footer-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Cột 2: Khám phá */}
          <div>
            <h3 className="mb-4 text-sm font-bold tracking-wider text-[var(--color-footer-text-primary)] uppercase">
              Khám phá
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-sm font-medium text-[var(--color-footer-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
                >
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  to="/search"
                  className="text-sm font-medium text-[var(--color-footer-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
                >
                  Tìm kiếm sự kiện
                </Link>
              </li>
              <li>
                <Link
                  to="/community"
                  className="text-sm font-medium text-[var(--color-footer-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
                >
                  Cộng đồng
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Quản lý tài khoản */}
          <div>
            <h3 className="mb-4 text-sm font-bold tracking-wider text-[var(--color-footer-text-primary)] uppercase">
              Tài khoản
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/user/profile"
                  className="text-sm font-medium text-[var(--color-footer-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
                >
                  Hồ sơ cá nhân
                </Link>
              </li>
              <li>
                <Link
                  to="/user/tickets"
                  className="text-sm font-medium text-[var(--color-footer-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
                >
                  Vé của tôi
                </Link>
              </li>
              <li>
                <Link
                  to="/user/orders"
                  className="text-sm font-medium text-[var(--color-footer-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
                >
                  Lịch sử giao dịch
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Liên hệ & Hỗ trợ */}
          <div>
            <h3 className="mb-4 text-sm font-bold tracking-wider text-[var(--color-footer-text-primary)] uppercase">
              Liên hệ
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm font-medium text-[var(--color-footer-text-secondary)]">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-primary)]" />
                <span>Khu công nghệ cao, TP. Thủ Đức, TP.HCM</span>
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-[var(--color-footer-text-secondary)]">
                <Phone className="h-4 w-4 flex-shrink-0 text-[var(--color-primary)]" />
                <span>1900 1234</span>
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-[var(--color-footer-text-secondary)]">
                <Mail className="h-4 w-4 flex-shrink-0 text-[var(--color-primary)]" />
                <span>support@shineticket.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-[var(--color-footer-border)] pt-8 md:flex-row">
          <p className="text-sm font-medium text-[var(--color-footer-text-secondary)]">
            © {currentYear} ShineTicket. All rights reserved.
          </p>
          <div className="mt-4 flex gap-6 md:mt-0">
            <a
              href="#"
              className="text-sm font-medium text-[var(--color-footer-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
            >
              Điều khoản sử dụng
            </a>
            <a
              href="#"
              className="text-sm font-medium text-[var(--color-footer-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
            >
              Chính sách bảo mật
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
