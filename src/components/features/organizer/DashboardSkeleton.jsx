// src/components/features/organizer/DashboardSkeleton.jsx

import React from 'react';

const SkeletonBar = ({ className }) => (
  <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
);

const SkeletonMetric = () => (
  <div className="flex items-center gap-4">
    <div className="h-12 w-12 flex-shrink-0 animate-pulse rounded-full bg-gray-200"></div>
    <div className="w-full space-y-1">
      <SkeletonBar className="h-3 w-1/2" />
      <SkeletonBar className="h-6 w-3/4" />
      <SkeletonBar className="h-3 w-1/4" />
    </div>
  </div>
);

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Skeleton cho Key Metrics - 4 cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <SkeletonMetric />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <SkeletonMetric />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <SkeletonMetric />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <SkeletonMetric />
        </div>
      </div>

      {/* Skeleton cho Charts Grid */}
      <div className="flex flex-col gap-6">
        {/* Revenue Chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <SkeletonBar className="mb-2 h-5 w-1/3" />
          <div className="mb-6 flex flex-wrap gap-4">
            <SkeletonBar className="h-4 w-40" />
            <SkeletonBar className="h-4 w-36" />
            <SkeletonBar className="h-4 w-32" />
          </div>
          <SkeletonBar className="h-[320px] w-full" />
        </div>

        {/* Ticket Breakdown Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <SkeletonBar className="mb-4 h-5 w-1/2" />
          <div className="mb-6 grid grid-cols-4 gap-4">
            <div className="rounded-lg bg-gray-50 p-3">
              <SkeletonBar className="mx-auto mb-2 h-5 w-5" />
              <SkeletonBar className="mx-auto mb-1 h-6 w-12" />
              <SkeletonBar className="mx-auto h-3 w-16" />
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <SkeletonBar className="mx-auto mb-2 h-5 w-5" />
              <SkeletonBar className="mx-auto mb-1 h-6 w-12" />
              <SkeletonBar className="mx-auto h-3 w-16" />
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <SkeletonBar className="mx-auto mb-2 h-5 w-5" />
              <SkeletonBar className="mx-auto mb-1 h-6 w-12" />
              <SkeletonBar className="mx-auto h-3 w-16" />
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <SkeletonBar className="mx-auto mb-2 h-5 w-5" />
              <SkeletonBar className="mx-auto mb-1 h-6 w-12" />
              <SkeletonBar className="mx-auto h-3 w-16" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SkeletonBar className="h-[320px] w-full" />
            <div className="space-y-3">
              <SkeletonBar className="h-20 w-full" />
              <SkeletonBar className="h-20 w-full" />
              <SkeletonBar className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Skeleton cho Recent Orders */}
      <div className="border-border-default bg-background-secondary rounded-lg border p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <SkeletonBar className="h-5 w-1/4" />
          <SkeletonBar className="h-4 w-20" />
        </div>
        <div className="space-y-4">
          <SkeletonBar className="h-16 w-full" />
          <SkeletonBar className="h-16 w-full" />
          <SkeletonBar className="h-16 w-full" />
        </div>
      </div>
    </div>
  );
}
