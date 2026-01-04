// src/components/ui/OrgCheckInSkeleton.jsx
import React from 'react';

export default function OrgCheckInSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200"></div>
          <div className="h-5 w-64 animate-pulse rounded-lg bg-gray-200"></div>
        </div>
        <div className="h-11 w-full animate-pulse rounded-lg bg-gray-200 sm:w-64"></div>
      </div>

      {/* Tabs Skeleton */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1">
          <div className="h-12 w-32 animate-pulse rounded-t-lg bg-gray-200"></div>
          <div className="h-12 w-32 animate-pulse rounded-t-lg bg-gray-200"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Card 1 */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-6 h-6 w-40 animate-pulse rounded bg-gray-200"></div>
          <div className="space-y-4">
            <div className="mx-auto h-48 w-48 animate-pulse rounded-full bg-gray-200"></div>
            <div className="space-y-3">
              <div className="h-20 w-full animate-pulse rounded bg-gray-200"></div>
              <div className="h-20 w-full animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-6 h-6 w-40 animate-pulse rounded bg-gray-200"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-32 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-5 w-20 animate-pulse rounded bg-gray-200"></div>
                </div>
                <div className="h-2 w-full animate-pulse rounded-full bg-gray-200"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
