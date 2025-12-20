import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSubscribeToJwtAuthWithFlag } from '@privy-io/react-auth';

// Wrapper này có nhiệm vụ đồng bộ trạng thái đăng nhập (JWT từ backend)
// sang Privy, để Privy tạo ví embedded cho user khi có privyToken.
const PrivyJwtSyncWrapper = ({ children }) => {
  const { isAuthenticated, privyToken } = useSelector((state) => state.auth);

  const hasPrivyToken = !!privyToken;
  const enabled = hasPrivyToken; // Khi có privyToken thì bật sync với Privy

  // Log mỗi khi state auth thay đổi
  useEffect(() => {
    console.log('🔁 [PrivyJwtSync] Redux auth state changed:', {
      isAuthenticated,
      hasPrivyToken,
      enabled,
      privyTokenSample: privyToken ? `${privyToken.slice(0, 20)}...` : null,
    });
  }, [isAuthenticated, hasPrivyToken, enabled, privyToken]);

  useSubscribeToJwtAuthWithFlag({
    enabled,
    // Đối với Privy, coi như "đã xác thực" nếu có privyToken
    isAuthenticated: enabled,
    // Ở project hiện tại chưa quản lý state loading cho auth, nên để false
    isLoading: false,
    getExternalJwt: async () => {
      console.log('[PrivyJwtSync] getExternalJwt called with:', {
        enabled,
        hasPrivyToken,
        isAuthenticatedForPrivy: enabled,
      });
      if (enabled && privyToken) {
        console.log('📨 [PrivyJwtSync] Sending privyToken to Privy');
        return privyToken;
      }
      console.log('⏸️ [PrivyJwtSync] Not sending JWT (no token)');
      return undefined;
    },
  });

  return <>{children}</>;
};

export default PrivyJwtSyncWrapper;
