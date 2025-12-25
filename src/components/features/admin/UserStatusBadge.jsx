import React from 'react';
import { CheckCircle, Ban, AlertCircle } from 'lucide-react';

const UserStatusBadge = ({ status }) => {
  const statusConfig = {
    active: {
      icon: CheckCircle,
      text: 'Active',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-500',
      borderColor: 'border-green-500/30',
    },
    banned: {
      icon: Ban,
      text: 'Banned',
      bgColor: 'bg-destructive/10',
      textColor: 'text-destructive',
      borderColor: 'border-destructive/30',
    },
    suspended: {
      icon: AlertCircle,
      text: 'Suspended',
      bgColor: 'bg-gray-500/10',
      textColor: 'text-gray-500',
      borderColor: 'border-gray-500/30',
    },
  };

  const config = statusConfig[status] || statusConfig.active;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.bgColor} ${config.textColor} ${config.borderColor}`}
    >
      <Icon className="h-3 w-3" />
      {config.text}
    </span>
  );
};

export default UserStatusBadge;
