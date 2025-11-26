import { useSelector } from 'react-redux';
import { useMemo } from 'react';

export const useAuth = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  return useMemo(
    () => ({
      user,
      isAuthenticated,
      role: user?.role,
    }),
    [user, isAuthenticated]
  );
};
