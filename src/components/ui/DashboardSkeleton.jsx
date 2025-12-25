import React from 'react';

const StatCardSkeleton = () => (
  <div className="bg-background-secondary border-border-default animate-pulse rounded-lg border p-6">
    <div className="flex items-start justify-between">
      <div className="flex-1 space-y-3">
        <div className="bg-background-primary h-4 w-24 rounded" />
        <div className="bg-background-primary h-8 w-32 rounded" />
        <div className="bg-background-primary h-3 w-40 rounded" />
      </div>
      <div className="bg-background-primary h-14 w-14 rounded-lg" />
    </div>
  </div>
);

const AlertCardSkeleton = () => (
  <div className="bg-background-secondary border-border-default animate-pulse rounded-lg border p-4">
    <div className="flex items-start gap-3">
      <div className="bg-background-primary h-10 w-10 rounded-lg" />
      <div className="flex-1 space-y-2">
        <div className="bg-background-primary h-4 w-full rounded" />
        <div className="bg-background-primary h-3 w-20 rounded" />
      </div>
    </div>
  </div>
);

const TopEventCardSkeleton = () => (
  <div className="bg-background-secondary border-border-default animate-pulse overflow-hidden rounded-lg border">
    <div className="bg-background-primary h-32" />
    <div className="space-y-3 p-4">
      <div className="bg-background-primary h-4 w-full rounded" />
      <div className="flex items-center gap-2">
        <div className="bg-background-primary h-5 w-16 rounded-full" />
        <div className="bg-background-primary h-3 w-20 rounded" />
      </div>
      <div className="flex items-center justify-between">
        <div className="bg-background-primary h-4 w-20 rounded" />
        <div className="bg-background-primary h-2 w-24 rounded-full" />
      </div>
    </div>
  </div>
);

const ActivityItemSkeleton = () => (
  <div className="animate-pulse pb-3 last:pb-0">
    <div className="flex items-start gap-3">
      <div className="bg-background-primary h-8 w-8 rounded-lg" />
      <div className="flex-1 space-y-2">
        <div className="bg-background-primary h-4 w-full rounded" />
        <div className="bg-background-primary h-3 w-3/4 rounded" />
        <div className="bg-background-primary h-3 w-1/2 rounded" />
      </div>
    </div>
  </div>
);

const ChartSkeleton = () => (
  <div className="bg-background-primary h-[300px] animate-pulse rounded-lg" />
);

const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Alert Cards Skeleton */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        <AlertCardSkeleton />
        <AlertCardSkeleton />
        <AlertCardSkeleton />
      </div>

      {/* Overview Stats Skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Transaction Stats Skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Top Events Skeleton */}
      <div className="bg-background-secondary border-border-default rounded-lg border p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="bg-background-primary h-5 w-5 animate-pulse rounded" />
          <div className="bg-background-primary h-6 w-48 animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <TopEventCardSkeleton />
          <TopEventCardSkeleton />
          <TopEventCardSkeleton />
          <TopEventCardSkeleton />
          <TopEventCardSkeleton />
        </div>
      </div>

      {/* Recent Activities Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-background-secondary border-border-default rounded-lg border p-6"
          >
            <div className="mb-4 flex items-center gap-2">
              <div className="bg-background-primary h-5 w-5 animate-pulse rounded" />
              <div className="bg-background-primary h-6 w-32 animate-pulse rounded" />
            </div>
            <div className="space-y-3">
              <ActivityItemSkeleton />
              <ActivityItemSkeleton />
              <ActivityItemSkeleton />
              <ActivityItemSkeleton />
              <ActivityItemSkeleton />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-background-secondary border-border-default rounded-lg border p-6"
          >
            <div className="mb-4 flex items-center gap-2">
              <div className="bg-background-primary h-5 w-5 animate-pulse rounded" />
              <div className="bg-background-primary h-6 w-48 animate-pulse rounded" />
            </div>
            <ChartSkeleton />
          </div>
        ))}
      </div>

      {/* Category Chart Skeleton */}
      <div className="bg-background-secondary border-border-default rounded-lg border p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="bg-background-primary h-5 w-5 animate-pulse rounded" />
          <div className="bg-background-primary h-6 w-64 animate-pulse rounded" />
        </div>
        <ChartSkeleton />
      </div>
    </div>
  );
};

export default DashboardSkeleton;
