import React from 'react';
import { Calendar, User, DollarSign, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const ActivityItem = ({
  icon: Icon,
  title,
  subtitle,
  time,
  link,
  iconColor = 'primary',
}) => (
  <div className="flex items-start gap-3 pb-3 last:pb-0">
    <div className={`bg-${iconColor}/10 rounded-lg p-2`}>
      <Icon className={`text-${iconColor} h-4 w-4`} />
    </div>
    <div className="min-w-0 flex-1">
      {link ? (
        <Link
          to={link}
          className="text-text-primary hover:text-primary block text-sm font-medium hover:underline"
        >
          {title}
        </Link>
      ) : (
        <p className="text-text-primary text-sm font-medium">{title}</p>
      )}
      {subtitle && (
        <p className="text-text-secondary mt-0.5 text-xs">{subtitle}</p>
      )}
      {time && (
        <p className="text-text-secondary mt-1 flex items-center gap-1 text-xs">
          <Clock className="h-3 w-3" />
          {time}
        </p>
      )}
    </div>
  </div>
);

export const PendingEventsList = ({ events }) => (
  <div className="space-y-3">
    {events.map((event) => (
      <ActivityItem
        key={event.id}
        icon={Calendar}
        title={event.name}
        subtitle={`${event.creator?.name} - ${event.category?.name}`}
        time={new Date(event.createdAt).toLocaleString('vi-VN')}
        link={`/admin/events?status=pending&eventId=${event.id}`}
        iconColor="warning"
      />
    ))}
  </div>
);

export const TransactionsList = ({ transactions }) => (
  <div className="space-y-3">
    {transactions.map((transaction) => {
      const statusColors = {
        success: 'text-green-600',
        pending: 'text-warning',
        failed: 'text-destructive',
      };

      return (
        <ActivityItem
          key={transaction.id}
          icon={DollarSign}
          title={`${transaction.amount.toLocaleString('vi-VN')} VNĐ`}
          subtitle={
            <span>
              {transaction.buyer?.name} -
              <span
                className={`ml-1 font-medium ${statusColors[transaction.status]}`}
              >
                {transaction.status}
              </span>
            </span>
          }
          time={new Date(transaction.createdAt).toLocaleString('vi-VN')}
          link={`/admin/transactions?transactionId=${transaction.id}`}
          iconColor="green"
        />
      );
    })}
  </div>
);

export const NewUsersList = ({ users }) => (
  <div className="space-y-3">
    {users.map((user) => (
      <ActivityItem
        key={user.id}
        icon={User}
        title={user.fullName}
        subtitle={user.email}
        time={new Date(user.createdAt).toLocaleString('vi-VN')}
        link={`/admin/users/${user.id}`}
        iconColor="blue"
      />
    ))}
  </div>
);
