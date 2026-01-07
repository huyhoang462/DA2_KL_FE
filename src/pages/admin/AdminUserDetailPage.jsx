import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  ShoppingBag,
  Ticket,
  CalendarDays,
  Wallet,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import ErrorDisplay from '../../components/ui/ErrorDisplay';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import UserStatusBadge from '../../components/features/admin/UserStatusBadge';
import UserRoleBadge from '../../components/features/admin/UserRoleBadge';
import UserOrdersTab from '../../components/features/admin/UserOrdersTab';
import UserEventsTab from '../../components/features/admin/UserEventsTab';
import { getUserById } from '../../services/adminService';

const AdminUserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');

  // Fetch user overview
  const {
    data: userData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['adminUser', id],
    queryFn: () => getUserById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  const user = userData?.data?.user;

  if (!user) {
    return <ErrorDisplay message="Không tìm thấy người dùng" />;
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="" size="sm" onClick={() => navigate('/admin/users')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-text-primary text-3xl font-bold">
              Chi tiết người dùng
            </h1>
          </div>
        </div>
      </div>

      {/* User Profile Header */}
      <div className="border-border-default bg-background-secondary rounded-lg border p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="bg-primary/10 text-primary flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full text-3xl font-bold">
              {user.fullName?.charAt(0).toUpperCase()}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-3">
                <h2 className="text-text-primary text-2xl font-bold">
                  {user.fullName}
                </h2>
                <UserStatusBadge status={user.status} />
                <UserRoleBadge role={user.role} />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="text-text-secondary flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>

                {user.phone && (
                  <div className="text-text-secondary flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4" />
                    <span>{user.phone}</span>
                  </div>
                )}

                {user.walletAddress && (
                  <div className="text-text-secondary flex items-center gap-2 text-sm">
                    <Wallet className="h-4 w-4" />
                    <span className="truncate font-mono text-xs">
                      {user.walletAddress}
                    </span>
                  </div>
                )}

                <div className="text-text-secondary flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Tham gia:{' '}
                    {new Date(user.createdAt).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {user.status === 'banned' && user.banReason && (
                <div className="bg-destructive/10 border-destructive/30 mt-3 rounded-lg border p-3">
                  <p className="text-destructive text-sm font-medium">
                    Lý do ban: {user.banReason}
                  </p>
                  {user.bannedAt && (
                    <p className="text-text-secondary mt-1 text-xs">
                      Bị ban vào:{' '}
                      {new Date(user.bannedAt).toLocaleString('vi-VN')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="bg-background-secondary border-border-default rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm font-medium">
                Tổng đơn hàng
              </p>
              <p className="text-text-primary mt-2 text-3xl font-bold">
                {user.totalOrders || 0}
              </p>
            </div>
            <div className="rounded-lg bg-blue-500/10 p-3">
              <ShoppingBag className="h-7 w-7 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-background-secondary border-border-default rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm font-medium">
                Tổng chi tiêu
              </p>
              <p className="text-text-primary mt-2 text-3xl font-bold">
                {((user.totalSpent || 0) / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="rounded-lg bg-green-500/10 p-3">
              <DollarSign className="h-7 w-7 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-background-secondary border-border-default rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm font-medium">
                Sự kiện tạo
              </p>
              <p className="text-text-primary mt-2 text-3xl font-bold">
                {user.totalEventsCreated || 0}
              </p>
            </div>
            <div className="rounded-lg bg-purple-500/10 p-3">
              <CalendarDays className="h-7 w-7 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-background-secondary border-border-default rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm font-medium">Tổng vé</p>
              <p className="text-text-primary mt-2 text-3xl font-bold">
                {user.totalTickets || 0}
              </p>
            </div>
            <div className="rounded-lg bg-orange-500/10 p-3">
              <Ticket className="h-7 w-7 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {user?.role === 'user' && (
        <div className="bg-background-secondary border-border-default rounded-lg border">
          {/* Tab Navigation */}
          <div className="border-border-default flex border-b">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'border-primary text-primary border-b-2'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <ShoppingBag className="mr-2 inline-block h-4 w-4" />
              Đơn hàng
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'events'
                  ? 'border-primary text-primary border-b-2'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <CalendarDays className="mr-2 inline-block h-4 w-4" />
              Sự kiện
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'orders' && <UserOrdersTab userId={id} />}
            {activeTab === 'events' && <UserEventsTab userId={id} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserDetailPage;
