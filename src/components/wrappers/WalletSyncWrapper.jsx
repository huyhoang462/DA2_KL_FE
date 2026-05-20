// components/wrappers/WalletSyncWrapper.jsx
import { useEffect, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useDispatch, useSelector } from 'react-redux';
import { handleSyncWallet } from '../../services/authService';
import { updateWalletAddress } from '../../store/slices/authSlice';

const WalletSyncWrapper = ({ children }) => {
  const { user: privyUser, ready, authenticated } = usePrivy();
  const isBackendAuthenticated = useSelector(
    (state) => state.auth.isAuthenticated
  );
  const dispatch = useDispatch();

  // Flags để ngăn race condition
  const isSyncing = useRef(false);
  const hasSynced = useRef(false);
  const lastSyncedAddress = useRef(null);

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

      if (ready && authenticated && privyUser) {
        //  console.log('🧩 [PrivyUser FULL OBJECT]:', privyUser);
      }

      const walletAddress = privyUser?.wallet?.address;

      // Điều kiện sync
      if (ready && isBackendAuthenticated && walletAddress) {
        // Ngăn gọi trùng lặp: đang sync HOẶC đã sync address này rồi
        if (isSyncing.current || lastSyncedAddress.current === walletAddress) {
          return;
        }

        isSyncing.current = true; // Lock

        try {
          const res = await handleSyncWallet({ walletAddress });

          if (res) {
            hasSynced.current = true;
            lastSyncedAddress.current = walletAddress; // Lưu address đã sync
            dispatch(updateWalletAddress(walletAddress)); // Lưu vào Redux store
            console.log('✅ [WalletSync] Synced successfully and saved to Redux');
          }
        } catch (syncErr) {
          console.error('❌ [WalletSync] Error:', syncErr);
        } finally {
          isSyncing.current = false; // Unlock
        }
      }
    };

    checkAndSync();
  }, [privyUser, isBackendAuthenticated, ready, authenticated, dispatch]);

  return <>{children}</>;
};

export default WalletSyncWrapper;
