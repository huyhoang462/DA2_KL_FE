import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSubscribeToJwtAuthWithFlag } from '@privy-io/react-auth';

// Wrapper này có nhiệm vụ đồng bộ trạng thái đăng nhập (JWT từ backend)
// sang Privy, để Privy tạo ví embedded cho user khi có privyToken.
const PrivyJwtSyncWrapper = ({ children }) => {
  const { isAuthenticated, privyToken } = useSelector((state) => state.auth);

  const hasPrivyToken = !!privyToken;
  // Luôn bật subscribe để khi logout ở Redux, Privy nhận được trạng thái
  // isAuthenticated=false thay vì bị "mất tín hiệu" do enabled=false.
  const enabled = true;
  const shouldAuthenticateWithPrivy = Boolean(isAuthenticated && hasPrivyToken);

  // Log mỗi khi state auth thay đổi
  useEffect(() => {
    console.log('🔁 [PrivyJwtSync] Redux auth state changed:', {
      isAuthenticated,
      hasPrivyToken,
      enabled,
      shouldAuthenticateWithPrivy,
      privyTokenSample: privyToken ? `${privyToken.slice(0, 20)}...` : null,
    });
  }, [
    isAuthenticated,
    hasPrivyToken,
    enabled,
    shouldAuthenticateWithPrivy,
    privyToken,
  ]);

  useSubscribeToJwtAuthWithFlag({
    enabled,
    // Chỉ xác thực với Privy khi app thực sự đang authenticated.
    isAuthenticated: shouldAuthenticateWithPrivy,
    // Ở project hiện tại chưa quản lý state loading cho auth, nên để false
    isLoading: false,
    getExternalJwt: async () => {
      console.log('[PrivyJwtSync] getExternalJwt called with:', {
        enabled,
        hasPrivyToken,
        isAuthenticatedForPrivy: shouldAuthenticateWithPrivy,
      });
      if (shouldAuthenticateWithPrivy && privyToken) {
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
