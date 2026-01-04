// src/components/ui/OrgOrdersTableSkeleton.jsx
import React from 'react';

export default function OrgOrdersTableSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200"></div>
          <div className="h-5 w-64 animate-pulse rounded-lg bg-gray-200"></div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="mb-2 h-8 w-16 animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="rounded-lg border border-gray-200 bg-white">
        {/* Table Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="h-10 w-80 animate-pulse rounded-lg bg-gray-200"></div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200"></div>
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="p-4">
              <div className="grid grid-cols-8 gap-4">
                <div className="h-5 w-full animate-pulse rounded bg-gray-200"></div>
                <div className="h-5 w-full animate-pulse rounded bg-gray-200"></div>
                <div className="h-5 w-full animate-pulse rounded bg-gray-200"></div>
                <div className="h-5 w-full animate-pulse rounded bg-gray-200"></div>
                <div className="h-5 w-full animate-pulse rounded bg-gray-200"></div>
                <div className="h-5 w-full animate-pulse rounded bg-gray-200"></div>
                <div className="h-5 w-full animate-pulse rounded bg-gray-200"></div>
                <div className="h-5 w-16 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="h-5 w-32 animate-pulse rounded bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 animate-pulse rounded bg-gray-200"></div>
              <div className="h-10 w-10 animate-pulse rounded bg-gray-200"></div>
              <div className="h-10 w-10 animate-pulse rounded bg-gray-200"></div>
              <div className="h-10 w-10 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
