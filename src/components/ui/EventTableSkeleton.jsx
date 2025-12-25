import React from 'react';

const EventTableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="bg-background-primary h-16 w-24 rounded" />
        <div className="flex-1 space-y-2">
          <div className="bg-background-primary h-4 w-48 rounded" />
          <div className="bg-background-primary h-3 w-32 rounded" />
          <div className="bg-background-primary h-3 w-40 rounded" />
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="bg-background-primary h-6 w-20 rounded-full" />
    </td>
    <td className="px-6 py-4">
      <div className="space-y-2">
        <div className="bg-background-primary h-4 w-16 rounded" />
        <div className="bg-background-primary h-3 w-24 rounded" />
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="space-y-2">
        <div className="bg-background-primary h-4 w-20 rounded" />
        <div className="bg-background-primary h-3 w-16 rounded" />
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="bg-background-primary h-4 w-24 rounded" />
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center justify-end gap-2">
        <div className="bg-background-primary h-8 w-8 rounded" />
        <div className="bg-background-primary h-8 w-8 rounded" />
        <div className="bg-background-primary h-8 w-8 rounded" />
        <div className="bg-background-primary h-8 w-8 rounded" />
      </div>
    </td>
  </tr>
);

const EventTableSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="bg-background-secondary h-9 w-64 animate-pulse rounded" />
          <div className="bg-background-secondary h-4 w-48 animate-pulse rounded" />
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="bg-background-secondary h-10 w-full animate-pulse rounded-lg" />
        </div>
        <div className="bg-background-secondary h-10 w-full animate-pulse rounded-lg" />
        <div className="bg-background-secondary h-10 w-full animate-pulse rounded-lg" />
        <div className="bg-background-secondary h-10 w-full animate-pulse rounded-lg" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-background-secondary border-border-default animate-pulse rounded-lg border p-4"
          >
            <div className="bg-background-primary mb-2 h-4 w-24 rounded" />
            <div className="bg-background-primary h-8 w-16 rounded" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-background-secondary border-border-default overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-primary border-border-default border-b">
              <tr>
                <th className="px-6 py-3 text-left">
                  <div className="bg-background-secondary h-4 w-24 animate-pulse rounded" />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="bg-background-secondary h-4 w-20 animate-pulse rounded" />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="bg-background-secondary h-4 w-24 animate-pulse rounded" />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="bg-background-secondary h-4 w-20 animate-pulse rounded" />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="bg-background-secondary h-4 w-20 animate-pulse rounded" />
                </th>
                <th className="px-6 py-3 text-right">
                  <div className="bg-background-secondary ml-auto h-4 w-24 animate-pulse rounded" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-border-default divide-y">
              {[...Array(10)].map((_, index) => (
                <EventTableRowSkeleton key={index} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between">
        <div className="bg-background-secondary h-4 w-48 animate-pulse rounded" />
        <div className="flex items-center gap-2">
          <div className="bg-background-secondary h-9 w-20 animate-pulse rounded" />
          <div className="bg-background-secondary h-9 w-20 animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
};

export default EventTableSkeleton;
