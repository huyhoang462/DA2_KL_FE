import { useState, useEffect, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { QRCodeSVG } from 'qrcode.react';

const TicketQR = ({ ticket, autoStart = false }) => {
  const { signMessage, user: privyUser, ready, authenticated } = usePrivy();
  const [qrData, setQrData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const hasAutoStartedRef = useRef(false);

  const handleGenerateQR = async () => {
    try {
      console.log('[TicketQR] Bắt đầu tạo QR cho ticket:', {
        rawTicket: ticket,
        ticketId: ticket?._id || ticket?.id,
        mintStatus: ticket?.mintStatus,
      });

      // Kiểm tra Privy đã sẵn sàng chưa
      console.log('[TicketQR] Privy state:', {
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
      if (!ticketId) {
        console.error('[TicketQR] Không tìm thấy ticketId (_id hoặc id)');
        alert('Không xác định được mã vé để tạo QR.');
        return;
      }
      setLoading(true);

      // 1. Lấy timestamp hiện tại
      const timestamp = Date.now();
      console.log('[TicketQR] Timestamp hiện tại:', timestamp);

      // 2. Tạo message để ký (Message này phải khớp logic với Backend)
      // Format: "Check-in ticket [ID] at timestamp [TIME]"
      const message = `Check-in ticket ${ticketId} at timestamp ${timestamp}`;
      console.log('[TicketQR] Message sẽ ký:', message, {
        type: typeof message,
        length: message?.length,
      });

      if (typeof message !== 'string' || !message.trim()) {
        console.error('[TicketQR] Message không hợp lệ, bỏ qua ký');
        alert('Không tạo được nội dung cần ký cho QR.');
        setLoading(false);
        return;
      }

      // 3. Gọi Privy để ký (Browser sẽ hiện popup ví)
      console.log('[TicketQR] Gọi signMessage từ Privy...');
      // Theo API của Privy v3, signMessage nhận object { message }
      const signature = await signMessage({ message });
      console.log('[TicketQR] Đã ký xong, signature:', signature);

      // 4. Đóng gói dữ liệu JSON
      const payload = {
        ticketId: ticketId,
        walletAddress: privyUser.wallet.address,
        timestamp: timestamp,
        signature: signature,
      };
      console.log('[TicketQR] Payload QR sẽ encode:', payload);

      // 5. Hiển thị QR
      setQrData(JSON.stringify(payload));
      setTimeLeft(60); // QR chỉ sống 60 giây
      setLoading(false);
      console.log('[TicketQR] Đã set QR + timeLeft, loading=false');
    } catch (error) {
      console.error('[TicketQR] Lỗi khi ký hoặc tạo QR:', error, {
        code: error?.code,
        message: error?.message,
      });
      setLoading(false);
      console.log('[TicketQR] Đặt loading=false trong catch');
      alert(
        `Lỗi khi ký: ${error?.message || 'Bạn đã hủy ký hoặc có lỗi xảy ra.'}`
      );
    }
  };

  // Tự động gọi ký ngay khi mở modal (nếu autoStart = true)
  useEffect(() => {
    if (autoStart && !hasAutoStartedRef.current && !qrData && !loading) {
      hasAutoStartedRef.current = true;
      console.log('[TicketQR] autoStart enabled -> gọi handleGenerateQR');
      handleGenerateQR();
    }
  }, [autoStart, qrData, loading]);

  // Logic đếm ngược
  useEffect(() => {
    console.log('[TicketQR] useEffect countdown - timeLeft, qrData:', {
      timeLeft,
      hasQrData: !!qrData,
    });
    if (timeLeft > 0 && qrData) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      if (qrData) {
        console.log('[TicketQR] Hết thời gian, clear QR');
      }
      setQrData(null); // Hết giờ thì xóa QR đi
    }
  }, [timeLeft, qrData]);

  return (
    <div className="mt-4 flex flex-col items-center justify-center rounded-lg border bg-white p-4 shadow-sm">
      <h3 className="mb-2 font-bold">Mã Check-in (Dynamic)</h3>

      {!qrData ? (
        <button
          onClick={handleGenerateQR}
          disabled={loading}
          className={`rounded px-4 py-2 font-medium text-white ${
            loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Đang tạo...' : '🖊️ Ký & Lấy QR'}
        </button>
      ) : (
        <div className="flex flex-col items-center">
          <div className="rounded border-2 border-blue-500 p-2">
            {/* Hiển thị QR Code */}
            <QRCodeSVG value={qrData} size={200} />
          </div>

          <p className="mt-3 animate-pulse text-lg font-bold text-red-600">
            Hết hạn sau: {timeLeft}s
          </p>
          <p className="mt-1 max-w-[200px] text-center text-xs text-gray-500">
            Đưa mã này cho nhân viên soát vé. Không chụp màn hình.
          </p>

          {/* Nút tắt thủ công nếu muốn */}
          <button
            onClick={() => setQrData(null)}
            className="mt-2 text-sm text-gray-400 underline"
          >
            Đóng mã
          </button>
        </div>
      )}
    </div>
  );
};

export default TicketQR;
