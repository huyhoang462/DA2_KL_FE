import React from 'react';
import { AlertTriangle, Info, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardAlertCard = ({ type, priority, message, action, link }) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return AlertTriangle;
      case 'error':
        return XCircle;
      case 'info':
      default:
        return Info;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-warning/10',
          border: 'border-warning/30',
          text: 'text-warning',
          iconBg: 'bg-warning/20',
        };
      case 'error':
        return {
          bg: 'bg-destructive/10',
          border: 'border-destructive/30',
          text: 'text-destructive',
          iconBg: 'bg-destructive/20',
        };
      case 'info':
      default:
        return {
          bg: 'bg-primary/10',
          border: 'border-primary/30',
          text: 'text-primary',
          iconBg: 'bg-primary/20',
        };
    }
  };

  const Icon = getIcon();
  const colors = getColorClasses();

  return (
    <div
      className={`${colors.bg} ${colors.border} rounded-lg border p-4 transition-all hover:shadow-md`}
    >
      <div className="flex items-start gap-3">
        <div className={`${colors.iconBg} rounded-lg p-2`}>
          <Icon className={`h-5 w-5 ${colors.text}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-text-primary text-sm font-medium">{message}</p>
          {action && link && (
            <Link
              to={link}
              className={`${colors.text} mt-1 inline-block text-sm font-medium hover:underline`}
            >
              {action} →
            </Link>
          )}
        </div>
        {priority === 'high' && (
          <span className="bg-destructive/10 text-destructive rounded-full px-2 py-0.5 text-xs font-medium">
            Urgent
          </span>
        )}
      </div>
    </div>
  );
};

export default DashboardAlertCard;
