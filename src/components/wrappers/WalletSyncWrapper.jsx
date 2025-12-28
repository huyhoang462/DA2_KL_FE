// components/wrappers/WalletSyncWrapper.jsx
import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useSelector } from 'react-redux';
import { handleSyncWallet } from '../../services/authService';

const WalletSyncWrapper = ({ children }) => {
  const { user: privyUser, ready, authenticated } = usePrivy(); // Lấy thêm 'authenticated' từ Privy
  const isBackendAuthenticated = useSelector(
    (state) => state.auth.isAuthenticated
  );

  useEffect(() => {
    // Hàm kiểm tra và sync
    const checkAndSync = async () => {
      // console.log('[Sync Check] State snapshot:', {
      //   ready,
      //   privyAuthenticated: authenticated,
      //   hasPrivyUser: !!privyUser,
      //   walletAddress: privyUser?.wallet?.address || null,
      //   isBackendAuthenticated,
      // });

      // Log chi tiết toàn bộ privyUser để xem cấu trúc thật
      if (ready && authenticated && privyUser) {
        console.log('🧩 [PrivyUser FULL OBJECT]:', privyUser);
      }

      if (ready && isBackendAuthenticated && privyUser?.wallet?.address) {
        console.log('✅ [WalletSync] Gửi yêu cầu sync ví xuống BE:', {
          walletAddress: privyUser.wallet.address,
        });
        try {
          const res = await handleSyncWallet({
            walletAddress: privyUser.wallet.address,
          });
          console.log('✅ [WalletSync] Kết quả từ BE:', res);
        } catch (syncErr) {
          console.error('❌ [WalletSync] Lỗi khi sync ví xuống BE:', syncErr);
        }
      }
    };

    // 1. Chạy ngay khi có thay đổi
    checkAndSync();

    // 2. [MỚI] Thiết lập interval để kiểm tra lại mỗi 5 giây (phòng trường hợp mạng lag)
    const intervalId = setInterval(checkAndSync, 5000);

    // Dọn dẹp khi component unmount
    return () => clearInterval(intervalId);
  }, [privyUser, isBackendAuthenticated, ready, authenticated]);

  return <>{children}</>;
};

export default WalletSyncWrapper;
