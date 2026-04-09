import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { logout as clearAuth } from '../store/slices/authSlice';
import { usePrivy } from '@privy-io/react-auth';

export const useAppLogout = () => {
  const dispatch = useDispatch();
  const { logout: privyLogout } = usePrivy();

  return useCallback(
    async ({ onBeforeClearAuth, onAfterClearAuth } = {}) => {
      try {
        await onBeforeClearAuth?.();

        // Clear Privy session first to avoid stale cross-user session.
        if (typeof privyLogout === 'function') {
          await privyLogout();
        }
      } catch (error) {
        console.error('[useAppLogout] Privy logout failed:', error);
      } finally {
        dispatch(clearAuth());

        // Keep persisted auth state in sync immediately.
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('persist:auth');
        }

        await onAfterClearAuth?.();
      }
    },
    [dispatch, privyLogout]
  );
};
