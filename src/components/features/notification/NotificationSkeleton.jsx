import React from 'react';

const NotificationSkeleton = () => {
  return (
    <div className="bg-background-secondary border-border-default animate-pulse rounded-xl border p-3">
      <div className="bg-foreground mb-2 h-3 w-2/3 rounded" />
      <div className="bg-foreground mb-2 h-3 w-full rounded" />
      <div className="bg-foreground h-3 w-1/3 rounded" />
    </div>
  );
};

export default NotificationSkeleton;
