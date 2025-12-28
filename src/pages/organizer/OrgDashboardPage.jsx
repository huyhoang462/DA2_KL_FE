// src/pages/manage/event/dashboard/OrgDashboardPage.jsx

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import {
  getDashboardOverview,
  getRevenueChart,
} from '../../services/eventService';

import ErrorDisplay from '../../components/ui/ErrorDisplay';
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
  return (
    <div className="space-y-6">
      {/* Event Info Header (Optional) */}
      {/* {overviewData.eventInfo && (
        <div className="border-border-default bg-background-secondary rounded-lg border p-4">
          <h2 className="text-text-primary text-xl font-bold">
            {overviewData.eventInfo.eventName}
          </h2>
          <p className="text-text-secondary mt-1 text-sm">
            Trạng thái:{' '}
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${statusInfo.color}`}
            >
              {statusInfo.label}
            </span>
          </p>
        </div>
      )} */}

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
    </div>
  );
}
