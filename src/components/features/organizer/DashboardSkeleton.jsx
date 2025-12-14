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
      {/* Skeleton cho Key Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <SkeletonMetric />
        <SkeletonMetric />
        <SkeletonMetric />
      </div>

      {/* Skeleton cho 2 Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="border-border-default bg-background-secondary rounded-lg border p-6 shadow-sm lg:col-span-3">
          <SkeletonBar className="mb-6 h-5 w-1/3" />
          <SkeletonBar className="h-80 w-full" />
        </div>
        <div className="border-border-default bg-background-secondary rounded-lg border p-6 shadow-sm lg:col-span-2">
          <SkeletonBar className="mb-6 h-5 w-1/2" />
          <SkeletonBar className="h-80 w-full" />
        </div>
      </div>

      {/* Skeleton cho Recent Orders */}
      <div className="border-border-default bg-background-secondary rounded-lg border p-6 shadow-sm">
        <SkeletonBar className="mb-6 h-5 w-1/4" />
        <div className="space-y-4">
          <SkeletonBar className="h-10 w-full" />
          <SkeletonBar className="h-10 w-full" />
          <SkeletonBar className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
