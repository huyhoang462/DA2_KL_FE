import { useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { logout as clearAuth } from '../store/slices/authSlice';
import { usePrivy } from '@privy-io/react-auth';

export const useAppLogout = () => {
  const dispatch = useDispatch();
  const { logout: privyLogout } = usePrivy();

  // Dùng ref để tránh stale closure — privyLogout có thể thay đổi
  // nhưng ta không muốn nó là dependency của useCallback bên dưới
  const privyLogoutRef = useRef(privyLogout);
  privyLogoutRef.current = privyLogout;

  return useCallback(
    async ({ onBeforeClearAuth, onAfterClearAuth } = {}) => {
      try {
        await onBeforeClearAuth?.();
      } catch (err) {
        console.error('[useAppLogout] onBeforeClearAuth failed:', err);
      }

      // 1. Xoá state local ngay lập tức (sync) → UI phản hồi tức thì
      dispatch(clearAuth());

      // 2. Xoá persisted auth khỏi localStorage ngay
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('persist:auth');
      }

      // 3. Callback sau khi clear (thường là navigate) → chạy ngay, không đợi Privy
      try {
        await onAfterClearAuth?.();
      } catch (err) {
        console.error('[useAppLogout] onAfterClearAuth failed:', err);
      }

      // 4. Privy logout chạy ngầm (fire-and-forget) — không block UI
      // Privy cần thời gian revoke session phía server (~3-10s),
      // nhưng client đã logged out hoàn toàn ở bước 1+2 nên không cần đợi.
      if (typeof privyLogoutRef.current === 'function') {
        privyLogoutRef.current().catch((err) => {
          console.error('[useAppLogout] Privy background logout failed:', err);
        });
      }
    },
    [dispatch] // privyLogout được đọc qua ref, không cần trong deps
  );
};
