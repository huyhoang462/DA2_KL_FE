import React from 'react';

const CategoryReportSkeleton = () => {
  return (
    <div className="animate-pulse space-y-6">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="bg-background-secondary border-border-default rounded-lg border p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="bg-background-primary h-4 w-24 rounded"></div>
                <div className="bg-background-primary mt-2 h-8 w-16 rounded"></div>
                {index === 1 && (
                  <div className="bg-background-primary mt-2 h-3 w-32 rounded"></div>
                )}
              </div>
              <div className="bg-background-primary h-12 w-12 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-background-secondary border-border-default rounded-lg border">
        <div className="border-border-default border-b p-6">
          <div className="bg-background-primary h-6 w-48 rounded"></div>
        </div>
        <div className="overflow-x-auto p-6">
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 pb-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-background-primary h-4 rounded"
                ></div>
              ))}
            </div>
            {/* Table Rows */}
            {Array.from({ length: 8 }).map((_, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-6 gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-background-primary h-9 w-9 rounded-lg"></div>
                  <div className="bg-background-primary h-4 w-24 rounded"></div>
                </div>
                {Array.from({ length: 5 }).map((_, colIndex) => (
                  <div
                    key={colIndex}
                    className="bg-background-primary h-4 rounded"
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryReportSkeleton;
