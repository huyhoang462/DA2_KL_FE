// components/wrappers/WalletSyncWrapper.jsx
import { useEffect, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useDispatch, useSelector } from 'react-redux';
import { handleSyncWallet } from '../../services/authService';
import { updateWalletAddress } from '../../store/slices/authSlice';

const WalletSyncWrapper = ({ children }) => {
  const { user: privyUser, ready } = usePrivy();
  const isBackendAuthenticated = useSelector(
    (state) => state.auth.isAuthenticated
  );
  const dispatch = useDispatch();

  // Flags để ngăn race condition
  const isSyncing = useRef(false);
  const hasSynced = useRef(false);
  const lastSyncedAddress = useRef(null);

  // Reset sync state khi user logout — tránh bug khi re-login với cùng wallet
  useEffect(() => {
    if (!isBackendAuthenticated) {
      hasSynced.current = false;
      lastSyncedAddress.current = null;
    }
  }, [isBackendAuthenticated]);

  useEffect(() => {
    const checkAndSync = async () => {
      const walletAddress = privyUser?.wallet?.address;

      // Điều kiện sync: Privy ready, backend đã auth, và có wallet address
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
    // Bỏ `authenticated` khỏi deps: không dùng trong logic, gây trigger effect thừa.
    // Chỉ cần: privyUser (wallet address), isBackendAuthenticated, ready, dispatch.
  }, [privyUser, isBackendAuthenticated, ready, dispatch]);

  return <>{children}</>;
};

export default WalletSyncWrapper;
