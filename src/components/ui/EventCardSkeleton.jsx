import React from 'react';

const SkeletonBar = ({ className }) => (
  <div className={`animate-pulse rounded bg-gray-300 ${className}`} />
);

export default function EventCardSkeleton() {
  return (
    <div className="bg-background-secondary overflow-hidden rounded-lg shadow-lg">
      <div className="relative aspect-[16/9] overflow-hidden">
        <SkeletonBar className="h-full w-full" />

        <div className="absolute top-2 right-2 rounded-full bg-gray-300 px-2 py-1 backdrop-blur-sm">
          <SkeletonBar className="h-3 w-16" />
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <SkeletonBar className="mb-2 h-5 w-3/4" />

        <SkeletonBar className="mt-3 h-4 w-1/3" />

        <div className="mt-3 space-y-2">
          <div className="flex items-start">
            <SkeletonBar className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0" />
            <SkeletonBar className="h-4 w-full" />
          </div>
          <div className="flex items-start">
            <SkeletonBar className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0" />
            <SkeletonBar className="h-4 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
