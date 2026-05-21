import React from 'react';

const AdminSummaryCard = ({
  title,
  value,
  icon: Icon,
  color = 'primary',
  onClick,
  disabled = false,
}) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    warning: 'bg-warning/10 text-warning',
    success: 'bg-success/10 text-success',
    info: 'bg-info/10 text-info',
    destructive: 'bg-destructive/10 text-destructive',
    'text-secondary': 'bg-text-secondary/10 text-text-secondary',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-background-secondary border-border-default rounded-lg border p-5 transition-shadow hover:shadow-sm ${
        onClick ? 'hover:bg-background-primary/50 cursor-pointer' : ''
      } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-text-secondary text-sm font-medium">{title}</p>
          <p className="text-text-primary mt-2 text-3xl font-bold">{value}</p>
        </div>
        <div
          className={`rounded-lg p-3 ${colorClasses[color] || colorClasses.primary}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

export default AdminSummaryCard;
