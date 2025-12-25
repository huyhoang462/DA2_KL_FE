import React from 'react';

const TransactionsTableSkeleton = () => {
  return (
    <div className="animate-pulse space-y-6">
      {/* Filters Skeleton */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1">
          <div className="bg-background-secondary mb-1 h-4 w-24 rounded"></div>
          <div className="bg-background-secondary h-10 w-full rounded-lg"></div>
        </div>
        <div className="flex-1">
          <div className="bg-background-secondary mb-1 h-4 w-20 rounded"></div>
          <div className="bg-background-secondary h-10 w-full rounded-lg"></div>
        </div>
        <div className="flex-1">
          <div className="bg-background-secondary mb-1 h-4 w-28 rounded"></div>
          <div className="bg-background-secondary h-10 w-full rounded-lg"></div>
        </div>
        <div className="flex gap-2">
          <div className="bg-background-secondary h-10 w-32 rounded-lg"></div>
          <div className="bg-background-secondary h-10 w-32 rounded-lg"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-background-secondary border-border-default rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-primary border-border-default border-b">
              <tr>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <th key={i} className="px-4 py-3">
                    <div className="bg-background-secondary h-4 w-20 rounded"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-border-default divide-y">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <tr key={i}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="bg-background-primary h-4 w-24 rounded"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Skeleton */}
        <div className="border-border-default flex items-center justify-between border-t px-6 py-4">
          <div className="bg-background-primary h-4 w-40 rounded"></div>
          <div className="flex gap-2">
            <div className="bg-background-primary h-10 w-10 rounded-lg"></div>
            <div className="bg-background-primary h-10 w-10 rounded-lg"></div>
            <div className="bg-background-primary h-10 w-10 rounded-lg"></div>
            <div className="bg-background-primary h-10 w-10 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsTableSkeleton;
