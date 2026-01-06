import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TrendingUp, TicketIcon, Users, Tag, BarChart3 } from 'lucide-react';
import RevenueReportTab from '../../components/features/admin/RevenueReportTab';
import TicketReportTab from '../../components/features/admin/TicketReportTab';
import UserReportTab from '../../components/features/admin/UserReportTab';
import CategoryReportTab from '../../components/features/admin/CategoryReportTab';

const AdminReportsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'revenue';
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  // Sync activeTab with URL
  useEffect(() => {
    const tab = searchParams.get('tab') || 'revenue';
    setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const tabs = [
    {
      id: 'revenue',
      label: 'Doanh thu',
      icon: TrendingUp,
      component: RevenueReportTab,
    },
    {
      id: 'tickets',
      label: 'Vé',
      icon: TicketIcon,
      component: TicketReportTab,
    },
    {
      id: 'users',
      label: 'Người dùng',
      icon: Users,
      component: UserReportTab,
    },
    {
      id: 'categories',
      label: 'Danh mục',
      icon: Tag,
      component: CategoryReportTab,
    },
  ];

  const ActiveTabComponent =
    tabs.find((tab) => tab.id === activeTab)?.component || RevenueReportTab;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-text-primary flex items-center gap-2 text-3xl font-bold">
            <BarChart3 className="h-8 w-8" />
            Báo cáo & Thống kê
          </h1>
          <p className="text-text-secondary mt-1 text-sm">
            Phân tích chi tiết về doanh thu, vé, người dùng và danh mục
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-background-secondary border-border-default overflow-hidden rounded-lg border">
        <div className="border-border-default flex border-b">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary border-b-2'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <ActiveTabComponent />
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
