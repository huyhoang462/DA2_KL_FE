import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, Tag } from 'lucide-react';
import {
  getDashboardOverview,
  getRevenueChart,
} from '../../services/eventService';
import Button from '../../components/ui/Button';
import ErrorDisplay from '../../components/ui/ErrorDisplay';
import KeyMetricsDisplay from '../../components/features/organizer/KeyMetricsDisplay';
import RevenueChart from '../../components/features/organizer/RevenueChart';
import TicketBreakdownCard from '../../components/features/organizer/TicketBreakdownCard';
import DashboardSkeleton from '../../components/features/organizer/DashboardSkeleton';

const AdminEventDetailPage = () => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
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
    staleTime: 5 * 60 * 1000,
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
    staleTime: 5 * 60 * 1000,
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
  const eventInfo = overviewData.eventInfo;

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant=""
            size="sm"
            onClick={() => navigate('/admin/events')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-text-primary text-3xl font-bold">
              Chi tiết sự kiện
            </h1>
          </div>
        </div>
      </div>

      {/* Event Info Card */}
      {eventInfo && (
        <div className="border-border-default bg-background-secondary rounded-lg border p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-3">
                <h2 className="text-text-primary text-2xl font-bold">
                  {eventInfo.eventName}
                </h2>
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                {eventInfo.organizerName && (
                  <div className="text-text-secondary flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>
                      Organizer:{' '}
                      <span className="text-text-primary font-medium">
                        {eventInfo.organizerName}
                      </span>
                    </span>
                  </div>
                )}

                {eventInfo.categoryName && (
                  <div className="text-text-secondary flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <span>
                      Danh mục:{' '}
                      <span className="text-text-primary font-medium">
                        {eventInfo.categoryName}
                      </span>
                    </span>
                  </div>
                )}

                {eventInfo.startDate && (
                  <div className="text-text-secondary flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Ngày:{' '}
                      <span className="text-text-primary font-medium">
                        {new Date(eventInfo.startDate).toLocaleDateString(
                          'vi-VN',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }
                        )}
                      </span>
                    </span>
                  </div>
                )}

                {eventInfo.location && (
                  <div className="text-text-secondary flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>
                      Địa điểm:{' '}
                      <span className="text-text-primary font-medium">
                        {eventInfo.location}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {eventInfo.bannerImageUrl && (
              <div className="ml-6 hidden md:block">
                <img
                  src={eventInfo.bannerImageUrl}
                  alt={eventInfo.eventName}
                  className="h-32 w-48 rounded-lg object-cover"
                />
              </div>
            )}
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
    </div>
  );
};

export default AdminEventDetailPage;
