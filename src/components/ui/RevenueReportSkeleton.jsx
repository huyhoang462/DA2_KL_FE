import React from 'react';

const RevenueReportSkeleton = () => {
  return (
    <div className="animate-pulse space-y-6">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-background-secondary border-border-default rounded-lg border p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="bg-background-primary mb-2 h-4 w-24 rounded"></div>
                <div className="bg-background-primary h-8 w-32 rounded"></div>
              </div>
              <div className="bg-background-primary h-12 w-12 rounded-full"></div>
            </div>
            <div className="bg-background-primary mt-3 h-4 w-40 rounded"></div>
          </div>
        ))}
      </div>

      {/* Chart Skeletons */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-background-secondary border-border-default rounded-lg border p-6"
        >
          <div className="bg-background-primary mb-6 h-6 w-48 rounded"></div>
          <div className="bg-background-primary h-[350px] w-full rounded-lg"></div>
        </div>
      ))}

      {/* Table Skeleton */}
      <div className="bg-background-secondary border-border-default rounded-lg border">
        <div className="border-border-default border-b p-6">
          <div className="bg-background-primary h-6 w-32 rounded"></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-primary border-border-default border-b">
              <tr>
                {[1, 2, 3, 4, 5].map((i) => (
                  <th key={i} className="px-6 py-3">
                    <div className="bg-background-secondary h-4 w-20 rounded"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-border-default divide-y">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  {[1, 2, 3, 4, 5].map((j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="bg-background-secondary h-4 w-24 rounded"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RevenueReportSkeleton;
