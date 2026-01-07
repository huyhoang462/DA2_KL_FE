// TicketCard.jsx - Horizontal Layout

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  MapPin,
  Calendar,
  Clock,
  QrCode,
  Globe,
  Building,
  Ticket,
} from 'lucide-react';

import Button from '../../ui/Button';
import Modal from '../../ui/Modal';
import { usePrivy } from '@privy-io/react-auth';
import { QRCodeSVG } from 'qrcode.react';

const STATUS_CONFIG = {
  pending: {
    label: 'Chưa sử dụng',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
  checkedIn: {
    label: 'Đã check-in',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  out: {
    label: 'Đã ra ngoài',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
  },
  expired: {
    label: 'Đã hết hạn',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
  },
  cancelled: {
    label: 'Đã hủy',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
  },
};

const MINT_STATUS_CONFIG = {
  pending: {
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  minted: {
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  default: {
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
  },
};

export default function TicketCard({ ticket }) {
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loadingQR, setLoadingQR] = useState(false);
  console.log('[TicketCard] status =', ticket.status, ticket);
  const { signMessage, user: privyUser, ready, authenticated } = usePrivy();

  const statusConfig = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.pending;
  const mintStatusConfig =
    MINT_STATUS_CONFIG[ticket.mintStatus] || MINT_STATUS_CONFIG.default;

  // Format ngày giờ
  const formattedDate = format(new Date(ticket.startTime), 'EEE, dd MMM yyyy', {
    locale: vi,
  });
  const formattedTime = `${format(new Date(ticket.startTime), 'HH:mm')} - ${format(
    new Date(ticket.endTime),
    'HH:mm'
  )}`;

  // Xác định icon location
  const isOnline = ticket.format === 'online';
  const LocationIcon = isOnline ? Globe : Building;

  const handleExportQR = async () => {
    try {
      console.log('[TicketCard] Bắt đầu flow Xuất QR cho ticket:', {
        rawTicket: ticket,
        ticketId: ticket?._id || ticket?.id,
        mintStatus: ticket?.mintStatus,
      });

      console.log('[TicketCard] Privy state:', {
        ready,
        authenticated,
        hasPrivyUser: !!privyUser,
        walletAddress: privyUser?.wallet?.address || null,
      });

      if (!ready) {
        alert('Hệ thống ví đang khởi tạo, vui lòng thử lại sau vài giây.');
        return;
      }

      if (!authenticated || !privyUser || !privyUser.wallet?.address) {
        alert(
          'Không tìm thấy ví Privy. Vui lòng đăng nhập lại hoặc chờ ví được tạo rồi thử lại.'
        );
        return;
      }

      const ticketId = ticket?._id || ticket?.id;
      const showId =
        ticket?.showId || ticket?.show?.id || ticket?.show?.showId || null;
      if (!ticketId) {
        console.error('[TicketCard] Không tìm thấy ticketId (_id hoặc id)');
        alert('Không xác định được mã vé để tạo QR.');
        return;
      }

      setLoadingQR(true);

      const timestamp = Date.now();
      const message = `Check-in ticket ${ticketId} at timestamp ${timestamp}`;
      console.log('[TicketCard] Message sẽ ký:', message);

      const signature = await signMessage({ message });
      console.log('[TicketCard] Đã ký xong, signature:', signature);

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
      setLoadingQR(false);
    } catch (error) {
      console.error('[TicketCard] Lỗi khi ký hoặc tạo QR:', error, {
        code: error?.code,
        message: error?.message,
      });
      setLoadingQR(false);

      // Nếu người dùng tự đóng popup / bấm hủy ký thì không hiện alert lỗi
      if (
        error?.code === 4001 ||
        (typeof error?.message === 'string' &&
          error.message.toLowerCase().includes('user rejected'))
      ) {
        return;
      }

      alert(
        `Lỗi khi ký: ${error?.message || 'Bạn đã hủy ký hoặc có lỗi xảy ra.'}`
      );
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

  return (
    <>
      {/* Horizontal Card Layout */}
      <div className="border-border-default bg-background-primary group overflow-hidden rounded-xl border transition-all hover:shadow-md">
        <div className="flex flex-col gap-4 p-4 md:flex-row">
          {/* Banner Image - Left Side */}
          <div className="relative h-32 w-full flex-shrink-0 overflow-hidden rounded-lg md:h-36 md:w-48">
            <img
              src={ticket.bannerImageUrl}
              alt={ticket.eventName}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Status Badge */}
            <div className="absolute top-2 right-2">
              <span
                className={`${statusConfig.bgColor} ${statusConfig.textColor} rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm`}
              >
                {statusConfig.label}
              </span>
            </div>
          </div>

          {/* Content - Right Side */}
          <div className="flex flex-1 flex-col justify-between gap-3">
            {/* Top Section: Event Info */}
            <div className="space-y-2">
              {/* Event Name */}
              <div>
                <h3 className="text-text-primary mb-0.5 line-clamp-1 text-base font-bold md:text-lg">
                  {ticket.eventName}
                </h3>
                <p className="text-text-secondary line-clamp-1 text-xs md:text-sm">
                  {ticket.showName}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {/* Date & Time */}
                <div className="flex items-center gap-2">
                  <Calendar className="text-primary h-4 w-4 flex-shrink-0" />
                  <div className="text-text-primary min-w-0 text-xs md:text-sm">
                    <p className="truncate font-medium">{formattedDate}</p>
                    <p className="text-text-secondary text-xs">
                      {formattedTime}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2">
                  <LocationIcon className="text-primary h-4 w-4 flex-shrink-0" />
                  <p className="text-text-primary line-clamp-2 min-w-0 text-xs md:text-sm">
                    {ticket.location ||
                      (isOnline ? 'Sự kiện trực tuyến' : 'Chưa có địa điểm')}
                  </p>
                </div>

                {/* Ticket Type */}
                <div className="flex items-center gap-2 md:col-span-2">
                  <Ticket className="text-primary h-4 w-4 flex-shrink-0" />
                  <p className="text-text-primary truncate text-xs font-medium md:text-sm">
                    {ticket.ticketTypeName}
                  </p>
                </div>

                {/* Mint Status */}
                <div className="flex items-center gap-2 md:col-span-2">
                  <QrCode className="text-primary h-4 w-4 flex-shrink-0" />
                  <p className="text-text-primary truncate text-xs md:text-sm">
                    Trạng thái mint:{' '}
                    <span
                      className={`${mintStatusConfig.bgColor} ${mintStatusConfig.textColor} ${mintStatusConfig.borderColor} inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold`}
                    >
                      {ticket.mintStatus || 'Không có'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Section: Action Button */}
            <div className="flex items-center justify-end">
              <Button
                onClick={handleExportQR}
                disabled={
                  loadingQR ||
                  ticket.status !== 'pending' ||
                  ticket.mintStatus !== 'minted'
                }
                className="w-full md:w-auto"
                variant="primary"
                size="sm"
              >
                <QrCode className="mr-2 h-4 w-4" />
                {loadingQR ? 'Đang tạo QR...' : 'Xuất QR'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && qrData && (
        <Modal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          title="Mã QR Vé"
        >
          <div className="space-y-4 text-center">
            <div className="mt-4 flex flex-col items-center justify-center rounded-lg border bg-white p-4 shadow-sm">
              <h3 className="mb-2 font-bold">Mã Check-in (Dynamic)</h3>
              <div className="flex flex-col items-center">
                <div className="rounded border-2 border-blue-500 p-2">
                  <QRCodeSVG value={qrData} size={200} />
                </div>
                <p className="mt-3 animate-pulse text-lg font-bold text-red-600">
                  Hết hạn sau: {timeLeft}s
                </p>
                <p className="mt-1 max-w-[200px] text-center text-xs text-gray-500">
                  Đưa mã này cho nhân viên soát vé. Không chụp màn hình.
                </p>
                <button
                  onClick={() => {
                    setShowQRModal(false);
                    setQrData(null);
                    // Reload lại trang sau khi đóng popup
                    if (typeof window !== 'undefined') {
                      window.location.reload();
                    }
                  }}
                  className="mt-3 rounded border border-gray-300 px-4 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                >
                  Đóng
                </button>
              </div>
            </div>
            <div className="text-text-secondary space-y-1 text-sm">
              <p className="font-semibold">{ticket.eventName}</p>
              <p>{ticket.showName}</p>
              <p>{ticket.ticketTypeName}</p>
            </div>
            <p className="text-text-tertiary text-xs">
              Vui lòng xuất trình mã QR này khi check-in tại sự kiện
            </p>
          </div>
        </Modal>
      )}
    </>
  );
}
