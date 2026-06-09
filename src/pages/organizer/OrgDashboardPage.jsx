// src/pages/manage/event/dashboard/OrgDashboardPage.jsx

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import {
  getDashboardOverview,
  getRevenueChart,
  settleEvent,
} from '../../services/eventService';
import { useClaimFundsWeb3 } from '../../hooks/useClaimFundsWeb3';
import { CircleDollarSign } from 'lucide-react';

import ErrorDisplay from '../../components/ui/ErrorDisplay';
import Button from '../../components/ui/Button';
import ConfirmModal from '../../components/ui/ConfirmModal';
import KeyMetricsDisplay from '../../components/features/organizer/KeyMetricsDisplay';
import RevenueChart from '../../components/features/organizer/RevenueChart';
import TicketBreakdownCard from '../../components/features/organizer/TicketBreakdownCard';
import RecentOrdersCard from '../../components/features/organizer/RecentOrdersCard';
import DashboardSkeleton from '../../components/features/organizer/DashboardSkeleton';

export default function OrgDashboardPage() {
  const { id: eventId } = useParams();
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
    groupBy: 'day',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { isClaiming, handleClaimFunds } = useClaimFundsWeb3();

  // Fetch Dashboard Overview
  const {
    data: overviewData,
    isLoading: isLoadingOverview,
    isError: isErrorOverview,
    error: errorOverview,
  } = useQuery({
    queryKey: ['dashboardOverview', eventId],
    queryFn: () => getDashboardOverview(eventId),
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
    enabled: !!eventId,
  });

  // Fetch Revenue Chart
  const {
    data: revenueData,
    isLoading: isLoadingRevenue,
    isError: isErrorRevenue,
    error: errorRevenue,
  } = useQuery({
    queryKey: ['revenueChart', eventId, dateRange],
    queryFn: () => getRevenueChart(eventId, dateRange),
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
    enabled: !!eventId,
  });

  // Loading state
  if (isLoadingOverview || isLoadingRevenue) {
    return <DashboardSkeleton />;
  }

  // Error state
  if (isErrorOverview) {
    return (
      <ErrorDisplay
        message={errorOverview?.message || 'Không thể tải dữ liệu tổng quan.'}
      />
    );
  }

  if (isErrorRevenue) {
    return (
      <ErrorDisplay
        message={errorRevenue?.message || 'Không thể tải dữ liệu doanh thu.'}
      />
    );
  }

  // No data state
  if (!overviewData || !revenueData) {
    return (
      <ErrorDisplay message="Không có dữ liệu tổng quan cho sự kiện này." />
    );
  }
  const getStatusInfo = (status) => {
    const statusMap = {
      draft: {
        label: 'Bản nháp',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
      },
      pending: {
        label: 'Chờ duyệt',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      },
      approved: {
        label: 'Đã duyệt',
        color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      },
      minting: {
        label: 'Đang mint',
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      },
      upcoming: {
        label: 'Sắp diễn ra',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
      },
      ongoing: {
        label: 'Đang diễn ra',
        color: 'bg-green-100 text-green-800 border-green-200',
      },
      completed: {
        label: 'Đã hoàn thành',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      },
      settled: {
        label: 'Đã tất toán',
        color: 'bg-violet-100 text-violet-800 border-violet-200',
      },
      rejected: {
        label: 'Bị từ chối',
        color: 'bg-red-100 text-red-800 border-red-200',
      },
      cancelled: {
        label: 'Đã hủy',
        color: 'bg-slate-100 text-slate-800 border-slate-200',
      },
    };
    return statusMap[status] || statusMap.draft;
  };

  const statusInfo = getStatusInfo(overviewData.eventInfo.status);
  const eventInfo = overviewData.eventInfo;

  const handleSettleEvent = async () => {
    setIsModalOpen(false);
    try {
      if (!eventInfo.onChainIds?.length) {
        throw new Error('Sự kiện chưa được cấu hình onChainId cho các hạng vé.');
      }
      const settlementData = await handleClaimFunds(eventInfo.onChainIds);
      await settleEvent(eventId, settlementData);
      queryClient.invalidateQueries(['dashboardOverview', eventId]);
    } catch (error) {
      console.error('Lỗi khi tất toán:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Event Info Header */}
      {eventInfo && (
        <div className="border-border-default bg-background-secondary rounded-lg border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-text-primary text-2xl font-bold flex items-center gap-3">
              {eventInfo.eventName}
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${statusInfo.color}`}
              >
                {statusInfo.label}
              </span>
            </h2>
          </div>
          {eventInfo.status === 'completed' && (
            <Button variant="success" onClick={() => setIsModalOpen(true)} disabled={isClaiming}>
              {isClaiming ? 'Đang xử lý...' : 'Tất toán'}
            </Button>
          )}
        </div>
      )}

      {/* Settlement Info Card */}
      {eventInfo?.status === 'settled' && eventInfo.settlementInfo && (
        <div className="border-border-default bg-background-secondary rounded-lg border p-6">
          <h3 className="text-text-primary mb-4 text-lg font-bold">Thông tin tất toán</h3>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div className="text-text-secondary flex flex-col gap-1">
              <span>Ngày tất toán:</span>
              <span className="text-text-primary font-medium">
                {new Date(eventInfo.settlementInfo.settledAt).toLocaleString('vi-VN')}
              </span>
            </div>
            <div className="text-text-secondary flex flex-col gap-1">
              <span>Transaction Hash:</span>
              <a
                href={`https://amoy.polygonscan.com/tx/${eventInfo.settlementInfo.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-500 hover:underline break-all"
              >
                {eventInfo.settlementInfo.txHash}
              </a>
            </div>
            <div className="text-text-secondary flex flex-col gap-1">
              <span>Ví Organizer (nhận {eventInfo.settlementInfo.organizerAmount} USDT):</span>
              <span className="text-text-primary font-medium break-all">
                {eventInfo.settlementInfo.organizerAddress}
              </span>
            </div>
            <div className="text-text-secondary flex flex-col gap-1">
              <span>Ví Admin (nhận {eventInfo.settlementInfo.adminAmount} USDT):</span>
              <span className="text-text-primary font-medium break-all">
                {eventInfo.settlementInfo.adminTreasuryAddress}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <KeyMetricsDisplay data={overviewData.metrics} />

      {/* Charts Grid */}
      <div className="flex flex-col gap-6">
        <div>
          <RevenueChart
            data={revenueData.data}
            summary={revenueData.summary}
            groupBy={revenueData.groupBy}
            onDateRangeChange={setDateRange}
          />
        </div>
        <div>
          <TicketBreakdownCard data={overviewData.ticketBreakdown} />
        </div>
      </div>

      {/* Recent Orders */}
      {/* <RecentOrdersCard
        data={overviewData.recentOrders || []}
        eventId={eventId}
      /> */}

      <ConfirmModal
        isOpen={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        title="Ký xác nhận tất toán sự kiện"
        icon={
          <div
            className={`bg-success/10 mx-auto flex h-14 w-14 items-center justify-center rounded-full`}
          >
            <CircleDollarSign
              className="text-success h-8 w-8"
              aria-hidden="true"
            />
          </div>
        }
        message="Bạn có chắc chắn muốn tất toán sự kiện này? Xác nhận sẽ cung cấp chữ ký gọi Smart Contract để chuyển tiền vào ví của bạn."
        confirmText="Xác nhận"
        confirmVariant="success"
        cancelText="Hủy"
        onConfirm={handleSettleEvent}
      />
    </div>
  );
}
