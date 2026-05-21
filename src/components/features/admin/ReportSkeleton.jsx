import React from 'react';

const ReportSkeleton = () => {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-background-secondary border-border-default h-28 rounded-lg border"
          />
        ))}
      </div>

      <div className="bg-background-secondary border-border-default rounded-lg border p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="bg-background-primary h-10 rounded-lg" />
          <div className="bg-background-primary h-10 rounded-lg" />
          <div className="bg-background-primary h-10 rounded-lg" />
          <div className="bg-background-primary h-10 rounded-lg" />
        </div>
      </div>

      <div className="bg-background-secondary border-border-default overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-primary border-border-default border-b">
              <tr>
                {[1, 2, 3, 4, 5, 6, 7].map((item) => (
                  <th key={item} className="px-4 py-3 text-left">
                    <div className="bg-background-secondary h-4 w-24 rounded" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-border-default divide-y">
              {[...Array(8)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {[...Array(7)].map((__, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-4">
                      <div className="bg-background-primary h-4 w-full rounded" />
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

export default ReportSkeleton;
