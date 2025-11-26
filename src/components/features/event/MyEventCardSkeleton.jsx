import React from 'react';

const SkeletonBar = ({ className }) => (
  <div className={`animate-pulse rounded bg-gray-300 ${className}`} />
);

export default function MyEventCardSkeleton() {
  return (
    <div className="border-border-default bg-background-secondary relative rounded-lg border shadow-sm">
      <div className="absolute top-4 right-0 animate-pulse rounded-l-md bg-gray-300 px-3 py-1 shadow-sm">
        <SkeletonBar className="h-3 w-16 bg-gray-400" />
      </div>

      <div className="flex flex-col p-4 sm:flex-row sm:p-6">
        <div className="mb-4 h-40 w-full flex-shrink-0 overflow-hidden rounded-md sm:mb-0 sm:h-40 sm:w-40">
          <SkeletonBar className="h-full w-full" />
        </div>

        <div className="flex flex-1 flex-col sm:ml-6">
          <SkeletonBar className="mt-2 h-6 w-3/4 md:pr-20" />
          <SkeletonBar className="mt-2 h-6 w-1/2 md:pr-20" />

          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <SkeletonBar className="h-4 w-4 flex-shrink-0" />
              <SkeletonBar className="h-4 w-3/5" />
            </div>
            <div className="flex items-center gap-2">
              <SkeletonBar className="h-4 w-4 flex-shrink-0" />
              <SkeletonBar className="h-4 w-4/5" />
            </div>
          </div>

          <div className="border-border-subtle mt-4 flex items-center space-x-6 border-t pt-4">
            <div>
              <SkeletonBar className="mb-1 h-3 w-16" />
              <SkeletonBar className="h-5 w-20" />
            </div>
            <div>
              <SkeletonBar className="mb-1 h-3 w-14" />
              <SkeletonBar className="h-5 w-24" />
            </div>
          </div>
        </div>
      </div>

      <div className="border-border-default bg-foreground/50 flex items-center justify-around border-t px-4 py-2">
        <SkeletonBar className="h-6 w-20 rounded-md" />
        <div className="bg-border-default h-4 w-px"></div>
        <SkeletonBar className="h-6 w-20 rounded-md" />
        <div className="bg-border-default h-4 w-px"></div>
        <SkeletonBar className="h-6 w-20 rounded-md" />
      </div>
    </div>
  );
}
