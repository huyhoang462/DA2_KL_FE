// TicketCard.jsx - Clean & Modern Layout

import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar, QrCode, Globe, MapPin, Ticket, Clock } from 'lucide-react';

import Button from '../../ui/Button';
import Modal from '../../ui/Modal';
import { usePrivy } from '@privy-io/react-auth';
import { QRCodeSVG } from 'qrcode.react';
import { getMyTickets } from '../../../services/ticketService';

const STATUS_CONFIG = {
  pending: {
    label: 'Chưa sử dụng',
    bgColor: 'bg-violet-100',
    textColor: 'text-violet-700',
    dotColor: 'bg-violet-500',
  },
  checkedIn: {
    label: 'Đã check-in',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
    dotColor: 'bg-emerald-500',
  },
  selling: {
    label: 'Đang đăng bán',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    dotColor: 'bg-amber-500',
  },
  out: {
    label: 'Đã ra ngoài',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-600',
    dotColor: 'bg-slate-400',
  },
  expired: {
    label: 'Đã hết hạn',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    dotColor: 'bg-red-400',
  },
  cancelled: {
    label: 'Đã hủy',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    dotColor: 'bg-red-400',
  },
};

const MINT_STATUS_CONFIG = {
  pending: {
    label: 'Đang mint',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
  },
  minted: {
    label: 'Đã mint',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
  },
  default: {
    label: 'Chưa mint',
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-500',
    borderColor: 'border-slate-200',
  },
};

export default function TicketCard({
  ticket,
  onClickSell = () => {},
  onCancelSell = () => {},
}) {
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loadingQR, setLoadingQR] = useState(false);
  const pollingIntervalRef = useRef(null);
  const { signMessage, user: privyUser, ready, authenticated } = usePrivy();

  const statusConfig = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.pending;
  const mintStatusConfig =
    MINT_STATUS_CONFIG[ticket.mintStatus] || MINT_STATUS_CONFIG.default;

  const formatUtcTime = (dateValue) => {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '';
    return `${String(date.getUTCHours()).padStart(2, '0')}:${String(
      date.getUTCMinutes()
    ).padStart(2, '0')}`;
  };

  const formattedDate = format(new Date(ticket.startTime), 'EEE, dd MMM yyyy', {
    locale: vi,
  });
  const formattedTime = `${formatUtcTime(ticket.startTime)} – ${formatUtcTime(
    ticket.endTime
  )}`;

  const isOnline = ticket.format === 'online';
  const LocationIcon = isOnline ? Globe : MapPin;

  const startCheckinPolling = async (ticketId) => {
    try {
      if (!ticketId) return;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      const startTime = Date.now();
      pollingIntervalRef.current = setInterval(async () => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= 60_000) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          return;
        }
        try {
          const tickets = await getMyTickets();
          const currentId = ticketId;
          const found = tickets?.find(
            (t) => (t?._id || t?.id)?.toString() === currentId?.toString()
          );
          if (found && found.status === 'checkedIn') {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          }
        } catch (err) {
          console.error('[TicketCard] Lỗi kiểm tra check-in:', err);
        }
      }, 3000);
    } catch (err) {
      console.error('[TicketCard] Lỗi polling:', err);
    }
  };

  const handleExportQR = async () => {
    try {
      if (!ready) {
        alert('Hệ thống ví đang khởi tạo, vui lòng thử lại sau vài giây.');
        return;
      }
      if (!authenticated || !privyUser || !privyUser.wallet?.address) {
        alert('Không tìm thấy ví Privy. Vui lòng đăng nhập lại.');
        return;
      }
      const ticketId = ticket?._id || ticket?.id;
      const showId =
        ticket?.showId || ticket?.show?.id || ticket?.show?.showId || null;
      if (!ticketId) {
        alert('Không xác định được mã vé.');
        return;
      }
      setLoadingQR(true);
      const timestamp = Date.now();
      const message = `Check-in ticket ${ticketId} at timestamp ${timestamp}`;
      const signature = await signMessage({ message });
      const payload = {
        ticketId,
        showId,
        walletAddress: privyUser.wallet.address,
        timestamp,
        signature,
      };
      setQrData(JSON.stringify(payload));
      setTimeLeft(60);
      setShowQRModal(true);
      startCheckinPolling(ticketId);
      setLoadingQR(false);
    } catch (error) {
      setLoadingQR(false);
      if (
        error?.code === 4001 ||
        (typeof error?.message === 'string' &&
          error.message.toLowerCase().includes('user rejected'))
      ) {
        return;
      }
      alert(`Lỗi khi ký: ${error?.message || 'Có lỗi xảy ra.'}`);
    }
  };

  useEffect(() => {
    if (timeLeft > 0 && qrData && showQRModal) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (timeLeft === 0 && qrData) {
      setQrData(null);
    }
  }, [timeLeft, qrData, showQRModal]);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);

  const convertLegacyTicketCode = (longCode) => {
    if (!longCode) return '';

    if (longCode.length === 9 && longCode.includes('-')) {
      return longCode.toUpperCase();
    }

    const SAFE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
    let shortCode = '';

    for (let i = 0; i < 8; i++) {
      let hashValue = i + 1; // Khởi tạo seed ban đầu

      for (let j = 0; j < longCode.length; j++) {
        hashValue =
          (hashValue * 31 + longCode.charCodeAt(j) * (i + 1)) % 1000000009;
      }

      const randomIndex = hashValue % SAFE_ALPHABET.length;
      shortCode += SAFE_ALPHABET[randomIndex];
    }

    return `${shortCode.slice(0, 4)}-${shortCode.slice(4, 8)}`;
  };

  return (
    <>
      {/* Bố cục Main Card: 
        1. Sử dụng bg-background-secondary và border-border-default.
        2. Dùng overflow-hidden để cắt gọn ảnh, không có hover rác làm lộ ảnh.
        3. Hiệu ứng hover:-translate-y-1 áp dụng lên toàn bộ thẻ mượt mà không bị rách viền.
      */}
      <div className="group border-border-default bg-background-secondary relative mb-4 flex w-full flex-col overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md md:flex-row">
        {/* --- Phần 1: Hình ảnh (Left) --- */}
        <div className="bg-background-primary relative h-44 w-full flex-shrink-0 overflow-hidden md:h-auto md:w-56">
          <img
            src={ticket.bannerImageUrl}
            alt={ticket.eventName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Overlay gradient nhẹ cho ảnh */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/5" />
        </div>

        {/* --- Phần 2: Nội dung chính (Middle) --- */}
        <div className="flex flex-1 flex-col p-4 md:p-6">
          {/* Badges Trạng thái */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusConfig.bgColor} ${statusConfig.textColor}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotColor}`}
              />
              {statusConfig.label}
            </span>

            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${mintStatusConfig.bgColor} ${mintStatusConfig.textColor} ${mintStatusConfig.borderColor}`}
            >
              <svg className="h-3 w-3" viewBox="0 0 14 14" fill="none">
                <path
                  d="M7 1L8.8 5.1L13 5.6L9.9 8.5L10.8 13L7 10.8L3.2 13L4.1 8.5L1 5.6L5.2 5.1L7 1Z"
                  fill="currentColor"
                />
              </svg>
              NFT: {mintStatusConfig.label}
            </span>
          </div>

          {/* Tên sự kiện */}
          <div className="mb-4">
            <h3 className="text-text-primary line-clamp-2 text-lg leading-tight font-bold md:text-xl">
              {ticket.eventName}
            </h3>
            <p className="text-text-secondary mt-1 line-clamp-1 text-sm font-medium">
              {ticket.showName}
            </p>
          </div>

          {/* Thông tin chi tiết */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Thời gian */}
            <div className="flex items-start gap-3">
              <Calendar className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
              <div className="flex flex-col">
                <p className="text-text-primary text-sm font-semibold">
                  {formattedDate}
                </p>
                <p className="text-text-secondary mt-0.5 flex items-center gap-1.5 text-xs font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  {formattedTime}
                </p>
              </div>
            </div>

            {/* Địa điểm */}
            <div className="flex items-start gap-3 sm:col-span-2">
              <LocationIcon className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
              <p className="text-text-primary line-clamp-3 text-sm leading-snug font-medium">
                {ticket.location ||
                  (isOnline ? 'Sự kiện trực tuyến' : 'Chưa có địa điểm')}
              </p>
            </div>
          </div>
        </div>

        {/* --- Đường nét đứt (Phân chia cuống vé) --- */}
        {/* Dùng border-dashed chuẩn xác, không dùng khoét lỗ rỗng */}
        <div className="border-border-default my-6 hidden border-l-[1.5px] border-dashed md:block" />
        <div className="border-border-default mx-4 block border-t-[1.5px] border-dashed md:hidden" />

        {/* --- Phần 3: Cuống vé & Thao tác (Right) --- */}
        <div className="bg-foreground flex w-full flex-col justify-between p-4 md:w-56 md:p-6">
          <div className="mb-4 flex items-center gap-2 md:gap-1">
            {/* <span className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
              Loại vé
            </span> */}
            <div className="flex items-center gap-1.5">
              <Ticket className="text-primary h-4 w-4" />
              <span className="text-text-primary truncate text-sm font-bold">
                {convertLegacyTicketCode(ticket.qrCode)}
              </span>
            </div>
          </div>
          {/* Loại vé */}
          <div className="mb-4 flex items-center gap-2 md:gap-1">
            <span className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
              Loại:
            </span>
            <div className="flex items-center gap-1.5">
              {/* <Ticket className="text-primary h-4 w-4" /> */}
              <span className="text-text-primary truncate text-sm font-bold">
                {ticket.ticketTypeName}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-auto flex flex-col gap-2.5">
            {ticket.status === 'pending' && (
              <>
                <button
                  onClick={handleExportQR}
                  disabled={
                    loadingQR ||
                    ticket.status !== 'pending' ||
                    ticket.mintStatus !== 'minted'
                  }
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                    loadingQR || ticket.mintStatus !== 'minted'
                      ? 'border-border-default bg-disabled-background text-disabled-text cursor-not-allowed opacity-70'
                      : 'border-border-default bg-background-secondary text-primary hover:border-primary hover:bg-primary hover:text-primary-foreground'
                  }`}
                >
                  <QrCode className="h-4 w-4" />
                  {loadingQR ? 'Đang tạo...' : 'Xuất QR'}
                </button>

                <button
                  onClick={() => onClickSell(ticket)}
                  disabled={ticket.mintStatus !== 'minted'}
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border border-transparent px-4 py-2 text-sm font-semibold shadow-sm ${ticket.mintStatus !== 'minted' ? 'bg-disabled-background text-disabled-text cursor-not-allowed opacity-70' : 'bg-primary text-primary-foreground hover:bg-primary-hover transition-all duration-200 hover:shadow-md active:scale-95'}`}
                >
                  Bán vé
                </button>
              </>
            )}

            {ticket.status === 'selling' && (
              <button
                onClick={() => onCancelSell(ticket)}
                className="border-destructive bg-destructive-background text-destructive-text-on-subtle hover:bg-destructive hover:text-destructive-foreground inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200"
              >
                Hủy đăng bán
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- Modal (Giữ nguyên cấu trúc logic) --- */}
      {showQRModal && qrData && (
        <Modal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          title="Mã QR Vé"
        >
          <div className="space-y-4 text-center">
            <div className="border-border-default bg-background-secondary mt-4 flex flex-col items-center justify-center rounded-xl border p-5 shadow-sm">
              <h3 className="text-text-primary mb-3 font-bold">
                Mã Check-in (Dynamic)
              </h3>
              <div className="flex flex-col items-center">
                <div className="border-primary rounded-xl border-2 bg-white p-3">
                  <QRCodeSVG value={qrData} size={200} />
                </div>
                <p className="text-destructive mt-4 animate-pulse text-lg font-bold">
                  Hết hạn sau: {timeLeft}s
                </p>
                <p className="text-text-secondary mt-2 max-w-[220px] text-center text-xs font-medium">
                  Đưa mã này cho nhân viên soát vé. Không chụp màn hình.
                </p>
                <button
                  onClick={() => {
                    if (pollingIntervalRef.current) {
                      clearInterval(pollingIntervalRef.current);
                      pollingIntervalRef.current = null;
                    }
                    setShowQRModal(false);
                    setQrData(null);
                    if (typeof window !== 'undefined') window.location.reload();
                  }}
                  className="border-border-default bg-background-primary text-text-primary hover:bg-border-subtle mt-4 rounded-lg border px-5 py-2 text-sm font-semibold transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
            <div className="text-text-secondary space-y-1.5 text-sm">
              <p className="text-text-primary font-bold">{ticket.eventName}</p>
              <p className="font-medium">{ticket.showName}</p>
              <p className="font-medium">{ticket.ticketTypeName}</p>
            </div>
            <p className="text-text-placeholder text-xs">
              Vui lòng xuất trình mã QR này khi check-in tại sự kiện
            </p>
          </div>
        </Modal>
      )}
    </>
  );
}
