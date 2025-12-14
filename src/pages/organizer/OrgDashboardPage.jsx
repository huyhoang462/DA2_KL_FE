// src/pages/manage/event/dashboard/OrgDashboardPage.jsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
// import { eventService } from '../../services/eventService';
import { mockDashboardData } from '../../utils/mockData';

import ErrorDisplay from '../../components/ui/ErrorDisplay';
import KeyMetricsDisplay from '../../components/features/organizer/KeyMetricsDisplay';
import RevenueChart from '../../components/features/organizer/RevenueChart';
import TicketBreakdownCard from '../../components/features/organizer/TicketBreakdownCard';
import RecentOrdersCard from '../../components/features/organizer/RecentOrdersCard';
import DashboardSkeleton from '../../components/features/organizer/DashboardSkeleton'; // <-- Import Skeleton

export default function OrgDashboardPage() {
  const { id: eventId } = useParams();

  // Dữ liệu giả
  const data = mockDashboardData;
  const isLoading = false; // Đổi thành true để xem skeleton
  const isError = false,
    error = null;

  /* --- DÙNG useQuery THẬT ---
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['eventDashboard', eventId],
    queryFn: () => eventService.getEventDashboard(eventId),
  });
  */

  // --- SỬA LẠI LOGIC RENDER ---
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return <ErrorDisplay message={error.message || 'Không thể tải dữ liệu.'} />;
  }

  if (!data) {
    return (
      <ErrorDisplay message="Không có dữ liệu tổng quan cho sự kiện này." />
    );
  }

  return (
    <div className="space-y-6">
      {/* Không có tiêu đề h1 ở đây, vì layout cha đã có */}
      <KeyMetricsDisplay data={data.keyMetrics} />

      <div className="flex flex-col gap-6">
        <div className="">
          <RevenueChart data={data.revenueOverTime} />
        </div>
        <div className="">
          <TicketBreakdownCard data={data.ticketBreakdown} />
        </div>
      </div>

      <RecentOrdersCard data={data.recentOrders} eventId={eventId} />
    </div>
  );
}
