import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Ticket,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  Activity,
  PieChart,
} from 'lucide-react';
import ErrorDisplay from '../../components/ui/ErrorDisplay';
import DashboardSkeleton from '../../components/ui/DashboardSkeleton';
import { getDashboardOverview } from '../../services/adminService';
import DashboardAlertCard from '../../components/features/admin/DashboardAlertCard';
import TopEventCard from '../../components/features/admin/TopEventCard';
import {
  PendingEventsList,
  TransactionsList,
  NewUsersList,
} from '../../components/features/admin/RecentActivityList';
import RevenueChart from '../../components/features/admin/RevenueChart';
import UserRegistrationChart from '../../components/features/admin/UserRegistrationChart';
import CategoryDistributionChart from '../../components/features/admin/CategoryDistributionChart';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'primary',
  trend,
  onClick,
}) => (
  <div
    className={`bg-background-secondary border-border-default group rounded-lg border p-6 transition-all hover:shadow-lg ${onClick ? 'hover:border-primary cursor-pointer' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-text-secondary mb-1 text-sm font-medium">{title}</p>
        <p className="text-text-primary mb-2 text-3xl font-bold">{value}</p>
        {subtitle && <p className="text-text-secondary text-sm">{subtitle}</p>}
        {trend && (
          <div
            className={`mt-2 flex items-center gap-1 text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            <TrendingUp
              className={`h-4 w-4 ${trend < 0 ? 'rotate-180' : ''}`}
            />
            <span>
              {trend > 0 ? '+' : ''}
              {trend.toFixed(1)}%
            </span>
            <span className="text-text-secondary text-xs font-normal">
              vs tháng trước
            </span>
          </div>
        )}
      </div>
      <div
        className={`bg-${color}/10 rounded-lg p-3 transition-transform group-hover:scale-110`}
      >
        <Icon className={`text-${color} h-7 w-7`} />
      </div>
    </div>
  </div>
);

const SectionCard = ({ title, icon: Icon, children, className = '' }) => (
  <div
    className={`bg-background-secondary border-border-default rounded-lg border p-6 ${className}`}
  >
    <div className="mb-4 flex items-center gap-2">
      {Icon && <Icon className="text-primary h-5 w-5" />}
      <h3 className="text-text-primary text-lg font-semibold">{title}</h3>
    </div>
    {children}
  </div>
);

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardOverview'],
    queryFn: getDashboardOverview,
    refetchInterval: 60000, // Refetch mỗi 60s
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  const { overview, charts, topSellingEvents, recentActivities, alerts } =
    data?.data || {};

  // Update alert links to include query params
  const processedAlerts = alerts?.map((alert) => {
    if (
      alert.link === '/admin/events' &&
      alert.message?.includes('chờ duyệt')
    ) {
      return { ...alert, link: '/admin/events?status=pending' };
    }
    return alert;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div>
        <h1 className="text-text-primary text-3xl font-bold">Dashboard</h1>
        <p className="text-text-secondary mt-1">Tổng quan hệ thống EventHub</p>
      </div> */}

      {/* Alerts Section */}
      {processedAlerts && processedAlerts.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {processedAlerts.map((alert, index) => (
            <DashboardAlertCard key={index} {...alert} />
          ))}
        </div>
      )}

      {/* Overview Stats - Row 1 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Tổng người dùng"
          value={overview?.users?.total?.toLocaleString() || '0'}
          subtitle={`${overview?.users?.organizers || 0} organizers`}
          icon={Users}
          onClick={() => navigate('/admin/users')}
        />
        <StatCard
          title="Tổng sự kiện"
          value={overview?.events?.total?.toLocaleString() || '0'}
          subtitle={`${overview?.events?.pending || 0} chờ duyệt, ${overview?.events?.ongoing || 0} đang diễn ra`}
          icon={Calendar}
          color="purple"
          onClick={() => navigate('/admin/events')}
        />
        <StatCard
          title="Doanh thu tháng này"
          value={`${((overview?.revenue?.thisMonth || 0) / 1000000).toFixed(1)}M`}
          subtitle={`Hôm nay: ${((overview?.revenue?.today || 0) / 1000).toFixed(0)}K VNĐ`}
          icon={DollarSign}
          color="green"
          trend={overview?.revenue?.growth}
          onClick={() => navigate('/admin/reports?tab=revenue')}
        />
        <StatCard
          title="Vé đã bán"
          value={overview?.tickets?.total?.toLocaleString() || '0'}
          subtitle={`${overview?.tickets?.today || 0} vé hôm nay`}
          icon={Ticket}
          color="orange"
          onClick={() => navigate('/admin/reports?tab=tickets')}
        />
      </div>

      {/* Transaction Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard
          title="Giao dịch thành công"
          value={overview?.transactions?.success?.toLocaleString() || '0'}
          icon={CheckCircle}
          color="green"
          onClick={() => navigate('/admin/transactions?status=success')}
        />
        <StatCard
          title="Đang xử lý"
          value={overview?.transactions?.pending?.toLocaleString() || '0'}
          icon={Clock}
          color="warning"
          onClick={() => navigate('/admin/transactions?status=pending')}
        />
        <StatCard
          title="Thất bại"
          value={overview?.transactions?.failed?.toLocaleString() || '0'}
          icon={XCircle}
          color="destructive"
          onClick={() => navigate('/admin/transactions?status=failed')}
        />
      </div>

      {/* Top Selling Events */}
      {topSellingEvents && topSellingEvents.length > 0 && (
        <SectionCard title="Top sự kiện bán chạy" icon={BarChart3}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {topSellingEvents.map((event) => (
              <TopEventCard key={event.id} event={event} />
            ))}
          </div>
        </SectionCard>
      )}

      {/* Recent Activities Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pending Events */}
        {recentActivities?.pendingEvents &&
          recentActivities.pendingEvents.length > 0 && (
            <SectionCard title="Sự kiện chờ duyệt" icon={Calendar}>
              <PendingEventsList events={recentActivities.pendingEvents} />
            </SectionCard>
          )}

        {/* Recent Transactions */}
        {recentActivities?.transactions &&
          recentActivities.transactions.length > 0 && (
            <SectionCard title="Giao dịch gần đây" icon={DollarSign}>
              <TransactionsList transactions={recentActivities.transactions} />
            </SectionCard>
          )}

        {/* New Users */}
        {recentActivities?.newUsers && recentActivities.newUsers.length > 0 && (
          <SectionCard title="Người dùng mới" icon={Users}>
            <NewUsersList users={recentActivities.newUsers} />
          </SectionCard>
        )}
      </div>

      {/* Charts Grid */}
      {charts && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Revenue Chart */}
          {charts.revenue && charts.revenue.length > 0 && (
            <SectionCard title="Doanh thu & Vé bán (7 ngày)" icon={Activity}>
              <RevenueChart data={charts.revenue} />
            </SectionCard>
          )}

          {/* User Registration Chart */}
          {charts.userRegistration && charts.userRegistration.length > 0 && (
            <SectionCard
              title="Người dùng đăng ký mới (7 ngày)"
              icon={BarChart3}
            >
              <UserRegistrationChart data={charts.userRegistration} />
            </SectionCard>
          )}
        </div>
      )}

      {/* Category Distribution Chart */}
      {charts?.categoryDistribution &&
        charts.categoryDistribution.length > 0 && (
          <SectionCard title="Phân bố sự kiện theo danh mục" icon={PieChart}>
            <CategoryDistributionChart data={charts.categoryDistribution} />
          </SectionCard>
        )}
    </div>
  );
};

export default AdminDashboardPage;
