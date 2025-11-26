import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Eye,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';

const StatCard = ({ title, value, change, icon: Icon, color = 'primary' }) => (
  <div className="bg-background-secondary border-border-default rounded-lg border p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-text-secondary text-sm font-medium">{title}</p>
        <p className="text-text-primary text-2xl font-bold">{value}</p>
        {change && (
          <p
            className={`text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {change > 0 ? '+' : ''}
            {change}% so với tháng trước
          </p>
        )}
      </div>
      <div className={`bg-${color}/10 text-${color} rounded-lg p-3`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  </div>
);

const AdminDashboardPage = () => {
  // Mock data - thay thế bằng API calls thật
  const stats = {
    totalUsers: 12543,
    totalEvents: 456,
    totalRevenue: 2540000,
    pendingApprovals: 23,
  };

  const recentActivities = [
    {
      id: 1,
      type: 'user',
      message: 'Người dùng mới đăng ký: user@example.com',
      time: '2 phút trước',
    },
    {
      id: 2,
      type: 'event',
      message: 'Sự kiện mới cần duyệt: "Concert nhạc rock"',
      time: '5 phút trước',
    },
    {
      id: 3,
      type: 'payment',
      message: 'Thanh toán thành công: 2,500,000 VNĐ',
      time: '10 phút trước',
    },
    {
      id: 4,
      type: 'event',
      message: 'Sự kiện được phê duyệt: "Workshop AI"',
      time: '15 phút trước',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-text-primary text-3xl font-bold">Dashboard</h1>
        <p className="text-text-secondary">Tổng quan hệ thống EventHub</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Tổng người dùng"
          value={stats.totalUsers.toLocaleString()}
          change={12}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Tổng sự kiện"
          value={stats.totalEvents.toLocaleString()}
          change={8}
          icon={Calendar}
          color="green"
        />
        <StatCard
          title="Doanh thu"
          value={`${(stats.totalRevenue / 1000000).toFixed(1)}M VNĐ`}
          change={15}
          icon={DollarSign}
          color="yellow"
        />
        <StatCard
          title="Chờ duyệt"
          value={stats.pendingApprovals.toLocaleString()}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Charts and Recent Activities */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Chart Placeholder */}
        <div className="bg-background-secondary border-border-default rounded-lg border p-6">
          <h3 className="text-text-primary mb-4 text-lg font-semibold">
            Thống kê người dùng
          </h3>
          <div className="bg-background-primary border-border-default flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
            <div className="text-center">
              <TrendingUp className="text-text-secondary mx-auto mb-2 h-12 w-12" />
              <p className="text-text-secondary">
                Biểu đồ thống kê sẽ được hiển thị ở đây
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-background-secondary border-border-default rounded-lg border p-6">
          <h3 className="text-text-primary mb-4 text-lg font-semibold">
            Hoạt động gần đây
          </h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="bg-primary/10 text-primary rounded-full p-2">
                  {activity.type === 'user' && <Users className="h-4 w-4" />}
                  {activity.type === 'event' && (
                    <Calendar className="h-4 w-4" />
                  )}
                  {activity.type === 'payment' && (
                    <DollarSign className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-text-primary text-sm">
                    {activity.message}
                  </p>
                  <p className="text-text-secondary text-xs">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-background-secondary border-border-default rounded-lg border p-6">
        <h3 className="text-text-primary mb-4 text-lg font-semibold">
          Thao tác nhanh
        </h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <button className="border-border-default bg-background-primary hover:bg-primary/5 flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors">
            <UserCheck className="text-primary h-8 w-8" />
            <span className="text-text-primary text-sm font-medium">
              Duyệt sự kiện
            </span>
          </button>
          <button className="border-border-default bg-background-primary hover:bg-primary/5 flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors">
            <Users className="text-primary h-8 w-8" />
            <span className="text-text-primary text-sm font-medium">
              Quản lý user
            </span>
          </button>
          <button className="border-border-default bg-background-primary hover:bg-primary/5 flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors">
            <Eye className="text-primary h-8 w-8" />
            <span className="text-text-primary text-sm font-medium">
              Xem báo cáo
            </span>
          </button>
          <button className="border-border-default bg-background-primary hover:bg-primary/5 flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors">
            <DollarSign className="text-primary h-8 w-8" />
            <span className="text-text-primary text-sm font-medium">
              Giao dịch
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
