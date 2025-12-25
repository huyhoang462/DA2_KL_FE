import React from 'react';

const EventStatusBadge = ({ status }) => {
  const statusConfig = {
    draft: {
      text: 'Draft',
      bgColor: 'bg-gray-500/10',
      textColor: 'text-gray-500',
      borderColor: 'border-gray-500/30',
    },
    pending: {
      text: 'Chờ duyệt',
      bgColor: 'bg-warning/10',
      textColor: 'text-warning',
      borderColor: 'border-warning/30',
    },
    upcoming: {
      text: 'Đã duyệt',
      bgColor: 'bg-success/10',
      textColor: 'text-success',
      borderColor: 'border-success/30',
    },
    ongoing: {
      text: 'Đang diễn ra',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-500',
      borderColor: 'border-blue-500/30',
    },
    rejected: {
      text: 'Đã từ chối',
      bgColor: 'bg-destructive/10',
      textColor: 'text-destructive',
      borderColor: 'border-destructive/30',
    },
    cancelled: {
      text: 'Đã hủy',
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-500',
      borderColor: 'border-red-500/30',
    },
    completed: {
      text: 'Hoàn thành',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-500',
      borderColor: 'border-purple-500/30',
    },
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.bgColor} ${config.textColor} ${config.borderColor}`}
    >
      {config.text}
    </span>
  );
};

export default EventStatusBadge;
