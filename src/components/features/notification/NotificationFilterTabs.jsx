import React from 'react';

const NotificationFilterTabs = ({
  tabs = [],
  activeKey = 'all',
  onChange,
  className = '',
}) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;

        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-foreground text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default NotificationFilterTabs;
