// src/pages/user/my-tickets/partials/TicketCardSkeleton.jsx
import React from 'react';

const SkeletonBar = ({ className }) => (
  <div className={`animate-pulse rounded bg-gray-300 ${className}`} />
);

export default function TicketCardSkeleton() {
  return (
    <div className="border-border-default bg-background-secondary flex w-full overflow-hidden rounded-xl border shadow-sm">
      {/* Placeholder ảnh */}
      <div className="hidden w-full flex-shrink-0">
        <SkeletonBar className="h-full w-full" />
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <SkeletonBar className="h-4 w-24" />
            <SkeletonBar className="h-5 w-20 rounded-full" />
          </div>

          <SkeletonBar className="h-6 w-3/4" />
          <SkeletonBar className="h-6 w-1/2" />

          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <SkeletonBar className="h-4 w-4" />
              <SkeletonBar className="h-4 w-40" />
            </div>
            <div className="flex items-center gap-2">
              <SkeletonBar className="h-4 w-4" />
              <SkeletonBar className="h-4 w-32" />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <SkeletonBar className="mb-1 h-3 w-12" />
            <SkeletonBar className="h-5 w-20" />
          </div>
          <SkeletonBar className="h-9 w-28 rounded-md" />
        </div>
      </div>
    </div>
  );
}
