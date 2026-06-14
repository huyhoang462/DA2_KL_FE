import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useSubscribeToJwtAuthWithFlag } from '@privy-io/react-auth';

// Wrapper này có nhiệm vụ đồng bộ trạng thái đăng nhập (JWT từ backend)
// sang Privy, để Privy tạo ví embedded cho user khi có privyToken.
const PrivyJwtSyncWrapper = ({ children }) => {
  const { isAuthenticated, privyToken } = useSelector((state) => state.auth);

  const shouldAuthenticateWithPrivy = Boolean(isAuthenticated && privyToken);

  // Fix stale closure: luôn dùng ref để lưu giá trị mới nhất
  // vì Privy có thể gọi getExternalJwt sau khi component đã re-render
  const privyTokenRef = useRef(privyToken);
  const shouldAuthRef = useRef(shouldAuthenticateWithPrivy);

  useEffect(() => {
    privyTokenRef.current = privyToken;
    shouldAuthRef.current = shouldAuthenticateWithPrivy;
  }, [privyToken, shouldAuthenticateWithPrivy]);

  useSubscribeToJwtAuthWithFlag({
    enabled: true,
    // Chỉ xác thực với Privy khi app thực sự đang authenticated.
    isAuthenticated: shouldAuthenticateWithPrivy,
    // Ở project hiện tại chưa quản lý state loading cho auth, nên để false
    isLoading: false,
    getExternalJwt: async () => {
      // Đọc từ ref thay vì closure để luôn có giá trị mới nhất
      if (shouldAuthRef.current && privyTokenRef.current) {
        return privyTokenRef.current;
      }
      return undefined;
    },
  });

  return <>{children}</>;
};

export default PrivyJwtSyncWrapper;
