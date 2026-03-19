import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  // --- LUỒNG XỬ LÝ ---

  // 1. Kiểm tra ĐĂNG NHẬP (Authentication)
  if (!isAuthenticated) {
    // Nếu chưa đăng nhập, điều hướng đến trang login.
    // `state={{ from: location }}` là "phép thuật" để quay lại trang cũ sau khi login thành công.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Kiểm tra VAI TRÒ (Authorization)
  // `allowedRoles` được truyền vào từ App.jsx
  const isAllowed = allowedRoles ? allowedRoles.includes(role) : true;

  if (!isAllowed) {
    // Nếu đã đăng nhập nhưng sai vai trò, điều hướng về trang chủ của role đó
    const roleRedirectMap = {
      admin: '/admin/dashboard',
      organizer: '/organizer/my-events',
      customer: '/',
    };
    const redirectPath = roleRedirectMap[role] || '/';
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}
