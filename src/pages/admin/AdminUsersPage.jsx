import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  UserCog,
  Ban,
  CheckCircle,
  Trash2,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  ShoppingBag,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorDisplay from '../../components/ui/ErrorDisplay';
import UserTableSkeleton from '../../components/ui/UserTableSkeleton';
import ConfirmModal from '../../components/ui/ConfirmModal';
import BanUserModal from '../../components/ui/BanUserModal';
import UserStatusBadge from '../../components/features/admin/UserStatusBadge';
import UserRoleBadge from '../../components/features/admin/UserRoleBadge';
import {
  getAllUsers,
  updateUserRole,
  banUser,
  unbanUser,
  deleteUser,
} from '../../services/adminService';

const AdminUsersPage = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [searchInput, setSearchInput] = useState('');
  const [expandedUser, setExpandedUser] = useState(null);

  // Modal states
  const [banModalState, setBanModalState] = useState({
    isOpen: false,
    user: null,
  });
  const [unbanModalState, setUnbanModalState] = useState({
    isOpen: false,
    user: null,
  });
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    user: null,
  });
  const [roleModalState, setRoleModalState] = useState({
    isOpen: false,
    user: null,
    newRole: '',
  });

  const limit = 20;

  // Fetch users
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminUsers', currentPage, filters],
    queryFn: () => getAllUsers({ ...filters, page: currentPage, limit }),
    placeholderData: (prev) => prev,
  });

  const users = data?.data?.users || [];
  const pagination = data?.data?.pagination || {};

  // Mutations
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers']);
      setRoleModalState({ isOpen: false, user: null, newRole: '' });
    },
  });

  const banUserMutation = useMutation({
    mutationFn: ({ userId, reason }) => banUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers']);
      setBanModalState({ isOpen: false, user: null });
    },
  });

  const unbanUserMutation = useMutation({
    mutationFn: (userId) => unbanUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers']);
      setUnbanModalState({ isOpen: false, user: null });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => deleteUser(userId, false),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers']);
      setDeleteModalState({ isOpen: false, user: null });
    },
  });

  // Handlers
  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchInput }));
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRoleChange = (user, newRole) => {
    setRoleModalState({ isOpen: true, user, newRole });
  };

  const handleBanUser = (user) => {
    setBanModalState({ isOpen: true, user });
  };

  const handleUnbanUser = (user) => {
    setUnbanModalState({ isOpen: true, user });
  };

  const handleDeleteUser = (user) => {
    setDeleteModalState({ isOpen: true, user });
  };

  if (isLoading && !data) {
    return <UserTableSkeleton />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-text-primary text-3xl font-bold">
            Quản lý người dùng
          </h1>
          <p className="text-text-secondary mt-1">
            Tổng {pagination.totalUsers || 0} người dùng
          </p>
        </div>
      </div>

      {/* Filters */}
      {/* <div className="bg-background-secondary border-border-default rounded-lg border p-4"> */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="md:col-span-2">
          <div className="relative">
            <Search className="text-text-secondary absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo tên hoặc email..."
              className="bg-background-secondary border-border-default text-text-primary placeholder:text-text-secondary focus:border-primary focus:ring-primary w-full rounded-lg border py-2 pr-4 pl-10 text-sm focus:ring-1 focus:outline-none"
            />
          </div>
        </form>

        {/* Role Filter */}
        <select
          value={filters.role}
          onChange={(e) => handleFilterChange('role', e.target.value)}
          className="bg-background-secondary border-border-default text-text-primary focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
        >
          <option value="">Tất cả role</option>
          <option value="user">User</option>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="bg-background-secondary border-border-default text-text-primary focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>
      {/* </div> */}

      {/* Users Table */}
      <div className="bg-background-secondary border-border-default overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-primary border-border-default border-b">
              <tr>
                <th className="text-text-secondary px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                  Người dùng
                </th>
                <th className="text-text-secondary px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                  Role
                </th>
                <th className="text-text-secondary px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                  Trạng thái
                </th>
                <th className="text-text-secondary px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                  Thống kê
                </th>
                <th className="text-text-secondary px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                  Ngày tạo
                </th>
                <th className="text-text-secondary px-6 py-3 text-right text-xs font-medium tracking-wider uppercase">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-border-default divide-y">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-text-secondary px-6 py-8 text-center"
                  >
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-background-primary transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full font-semibold">
                          {user.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-text-primary font-medium">
                            {user.fullName}
                          </p>
                          <p className="text-text-secondary flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </p>
                          {user.phone && (
                            <p className="text-text-secondary flex items-center gap-1 text-xs">
                              <Phone className="h-3 w-3" />
                              {user.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <UserRoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4">
                      <UserStatusBadge status={user.status} />
                      {user.status === 'banned' && user.banReason && (
                        <p className="text-destructive mt-1 text-xs italic">
                          {user.banReason}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm">
                        <p className="text-text-secondary flex items-center gap-1">
                          <ShoppingBag className="h-3 w-3" />
                          {user.totalOrders || 0} đơn hàng
                        </p>
                        <p className="text-text-secondary flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {((user.totalSpent || 0) / 1000).toFixed(0)}K VNĐ
                        </p>
                      </div>
                    </td>
                    <td className="text-text-secondary px-6 py-4 text-sm">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Role Change Dropdown */}
                        {/* {user.role !== 'admin' && (
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleRoleChange(user, e.target.value)
                            }
                            className="bg-background-primary border-border-default text-text-primary focus:border-primary rounded border px-2 py-1 text-xs focus:outline-none"
                          >
                            <option value="user">User</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                          </select>
                        )} */}

                        {/* Ban/Unban Button */}
                        {user.status === 'banned' ? (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleUnbanUser(user)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        ) : user.role !== 'admin' ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleBanUser(user)}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        ) : null}

                        {/* Delete Button */}
                        {user.role !== 'admin' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteUser(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-text-secondary text-sm">
            Trang {pagination.currentPage} / {pagination.totalPages} - Tổng{' '}
            {pagination.totalUsers} người dùng
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
              Trước
            </Button>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              variant="outline"
              size="sm"
            >
              Sau
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <BanUserModal
        isOpen={banModalState.isOpen}
        userName={banModalState.user?.fullName}
        onConfirm={(reason) => {
          banUserMutation.mutate({
            userId: banModalState.user.id,
            reason,
          });
        }}
        onCancel={() => setBanModalState({ isOpen: false, user: null })}
        isLoading={banUserMutation.isPending}
      />

      <ConfirmModal
        isOpen={unbanModalState.isOpen}
        title="Unban người dùng"
        message={
          <div>
            Bạn có chắc chắn muốn unban{' '}
            <strong>{unbanModalState.user?.fullName}</strong>?
            <br />
            <span className="text-text-secondary text-sm">
              Người dùng sẽ có thể đăng nhập lại.
            </span>
          </div>
        }
        icon={
          <div className="bg-success/30 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
            <CheckCircle className="text-success h-6 w-6" />
          </div>
        }
        onConfirm={() => unbanUserMutation.mutate(unbanModalState.user.id)}
        onCancel={() => setUnbanModalState({ isOpen: false, user: null })}
        confirmText="Unban"
        confirmVariant="success"
        isLoading={unbanUserMutation.isPending}
      />

      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        title="Xóa người dùng"
        message={
          <div>
            Bạn có chắc chắn muốn xóa{' '}
            <strong>{deleteModalState.user?.fullName}</strong>?
            <br />
            <span className="text-text-secondary text-sm">
              Người dùng sẽ bị suspend (soft delete). Dữ liệu vẫn được giữ lại.
            </span>
          </div>
        }
        onConfirm={() => deleteUserMutation.mutate(deleteModalState.user.id)}
        onCancel={() => setDeleteModalState({ isOpen: false, user: null })}
        confirmText="Xóa"
        confirmVariant="destructive"
        isLoading={deleteUserMutation.isPending}
      />

      <ConfirmModal
        isOpen={roleModalState.isOpen}
        title="Thay đổi role"
        message={
          <div>
            Bạn có chắc chắn muốn thay đổi role của{' '}
            <strong>{roleModalState.user?.fullName}</strong> từ{' '}
            <strong>{roleModalState.user?.role}</strong> thành{' '}
            <strong>{roleModalState.newRole}</strong>?
          </div>
        }
        icon={
          <div className="bg-primary/30 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
            <UserCog className="text-primary h-6 w-6" />
          </div>
        }
        onConfirm={() =>
          updateRoleMutation.mutate({
            userId: roleModalState.user.id,
            role: roleModalState.newRole,
          })
        }
        onCancel={() =>
          setRoleModalState({ isOpen: false, user: null, newRole: '' })
        }
        confirmText="Xác nhận"
        confirmVariant="primary"
        isLoading={updateRoleMutation.isPending}
      />
    </div>
  );
};

export default AdminUsersPage;
