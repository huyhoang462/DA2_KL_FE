import React from 'react';

const UserRoleBadge = ({ role }) => {
  const roleConfig = {
    admin: {
      text: 'Admin',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-500',
      borderColor: 'border-purple-500/30',
    },
    staff: {
      text: 'Staff',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-500',
      borderColor: 'border-blue-500/30',
    },
    user: {
      text: 'User',
      bgColor: 'bg-gray-500/10',
      textColor: 'text-gray-500',
      borderColor: 'border-gray-500/30',
    },
  };

  const config = roleConfig[role] || roleConfig.user;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.bgColor} ${config.textColor} ${config.borderColor}`}
    >
      {config.text}
    </span>
  );
};

export default UserRoleBadge;
