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
    // Nếu đã đăng nhập nhưng sai vai trò:
    // - Admin cố vào trang user -> Đẩy về trang chủ của Admin.
    // - User cố vào trang admin -> Đẩy về trang chủ của User.
    const redirectPath = role === 'admin' ? '/admin/dashboard' : '/';
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}
