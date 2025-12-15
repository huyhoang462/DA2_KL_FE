// src/pages/user/my-tickets/MyTicketsPage.jsx

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Calendar,
  PlayCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

import { getMyTickets } from '../../services/ticketService';
import TicketCard from '../../components/features/ticket/TicketCard';
import TicketCardSkeleton from '../../components/features/ticket/TicketCardSkeleton';
import Input from '../../components/ui/Input';
import ErrorDisplay from '../../components/ui/ErrorDisplay';

const TABS = [
  {
    key: 'upcoming',
    label: 'Sắp diễn ra',
    icon: Calendar,
    emptyMessage: 'Bạn chưa có vé nào sắp diễn ra',
  },
  {
    key: 'ongoing',
    label: 'Đang diễn ra',
    icon: PlayCircle,
    emptyMessage: 'Không có sự kiện nào đang diễn ra',
  },
  {
    key: 'past',
    label: 'Đã qua',
    icon: CheckCircle,
    emptyMessage: 'Bạn chưa có vé nào đã qua',
  },
  {
    key: 'cancelled',
    label: 'Đã hủy',
    icon: XCircle,
    emptyMessage: 'Bạn không có vé nào bị hủy',
  },
];

export default function MyTicketsPage() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Fetch tickets data
  const {
    data: allTickets = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['myTickets'],
    queryFn: getMyTickets,
    staleTime: 1000 * 60 * 2, // Cache 2 phút
  });

  // Filter và sort tickets theo tab
  const filteredTickets = useMemo(() => {
    if (isLoading || !allTickets) return [];

    const now = new Date();

    let filtered = allTickets.filter((ticket) => {
      // Filter theo search
      const matchesSearch =
        searchTerm === '' ||
        ticket.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.showName?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Filter theo tab
      const startTime = new Date(ticket.startTime);
      const endTime = new Date(ticket.endTime);

      switch (activeTab) {
        case 'upcoming':
          // Sắp diễn ra: chưa đến startTime và status = pending
          return startTime > now && ticket.status === 'pending';

        case 'ongoing':
          // Đang diễn ra: trong khoảng startTime - endTime, chưa cancelled/expired
          return (
            startTime <= now &&
            endTime >= now &&
            ticket.status !== 'cancelled' &&
            ticket.status !== 'expired'
          );

        case 'past':
          // Đã qua: sau endTime hoặc status = expired/checkedIn/out
          return (
            endTime < now ||
            ticket.status === 'expired' ||
            ticket.status === 'checkedIn' ||
            ticket.status === 'out'
          );

        case 'cancelled':
          // Đã hủy: status = cancelled
          return ticket.status === 'cancelled';

        default:
          return true;
      }
    });

    // Sort theo tab
    filtered.sort((a, b) => {
      const timeA = new Date(a.startTime).getTime();
      const timeB = new Date(b.startTime).getTime();

      if (activeTab === 'upcoming' || activeTab === 'ongoing') {
        // Sắp diễn ra / Đang diễn ra: gần nhất trước (ASC)
        return timeA - timeB;
      } else {
        // Đã qua / Đã hủy: mới nhất trước (DESC)
        return timeB - timeA;
      }
    });

    return filtered;
  }, [activeTab, searchTerm, allTickets, isLoading]);

  // Tính số lượng vé cho mỗi tab
  const tabCounts = useMemo(() => {
    if (!allTickets) return {};
    const now = new Date();
    const counts = { upcoming: 0, ongoing: 0, past: 0, cancelled: 0 };

    allTickets.forEach((ticket) => {
      const startTime = new Date(ticket.startTime);
      const endTime = new Date(ticket.endTime);

      if (ticket.status === 'cancelled') {
        counts.cancelled++;
      } else if (startTime > now && ticket.status === 'pending') {
        counts.upcoming++;
      } else if (
        startTime <= now &&
        endTime >= now &&
        ticket.status !== 'cancelled' &&
        ticket.status !== 'expired'
      ) {
        counts.ongoing++;
      } else if (
        endTime < now ||
        ticket.status === 'expired' ||
        ticket.status === 'checkedIn' ||
        ticket.status === 'out'
      ) {
        counts.past++;
      }
    });

    return counts;
  }, [allTickets]);

  // Pagination
  const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE);
  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredTickets.slice(startIndex, endIndex);
  }, [filteredTickets, currentPage]);

  // Reset về trang 1 khi đổi tab hoặc search
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const currentTab = TABS.find((tab) => tab.key === activeTab);

  return (
    <div className="space-y-6">
      {/* Search Bar & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-text-placeholder absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
          <Input
            placeholder="Tìm kiếm theo tên sự kiện, địa điểm..."
            inputClassName="pl-10 py-2.5"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tab Select */}
        <div className="relative min-w-[200px]">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="border-border-default bg-background-secondary text-text-primary focus:border-primary focus:ring-primary/20 w-full cursor-pointer appearance-none rounded-lg border px-4 py-2.5 pr-10 text-sm font-medium transition-colors focus:ring-2 focus:outline-none"
          >
            {TABS.map((tab) => {
              const count = tabCounts[tab.key] || 0;
              return (
                <option key={tab.key} value={tab.key}>
                  {tab.label} {count > 0 ? `(${count})` : ''}
                </option>
              );
            })}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
            <svg
              className="text-text-secondary h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Ticket List */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[...Array(4)].map((_, i) => (
            <TicketCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorDisplay
          message={error?.message || 'Không thể tải danh sách vé.'}
        />
      ) : filteredTickets.length > 0 ? (
        <div className="space-y-4">
          <p className="text-text-secondary text-sm">
            Hiển thị{' '}
            <span className="font-semibold">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>
            -
            <span className="font-semibold">
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredTickets.length)}
            </span>{' '}
            trong tổng số{' '}
            <span className="font-semibold">{filteredTickets.length}</span> vé
          </p>
          <div className="space-y-3">
            {paginatedTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="border-border-default text-text-primary hover:bg-background-secondary disabled:text-text-tertiary rounded-lg border px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
              >
                Trước
              </button>

              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  // Hiển thị: 1 ... current-1 current current+1 ... last
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`min-w-[40px] rounded-lg px-3 py-2 text-sm font-medium ${
                          currentPage === pageNum
                            ? 'bg-primary text-primary-foreground'
                            : 'border-border-default text-text-primary hover:bg-background-secondary border'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return (
                      <span
                        key={pageNum}
                        className="text-text-tertiary px-2 py-2 text-sm"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="border-border-default text-text-primary hover:bg-background-secondary disabled:text-text-tertiary rounded-lg border px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="border-border-default bg-background-secondary flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
          <div className="bg-background-primary mb-4 rounded-full p-4">
            {currentTab && (
              <currentTab.icon className="text-text-secondary h-8 w-8" />
            )}
          </div>
          <h3 className="text-text-primary mb-2 text-lg font-semibold">
            {searchTerm ? 'Không tìm thấy vé' : currentTab?.emptyMessage}
          </h3>
          <p className="text-text-secondary text-sm">
            {searchTerm
              ? 'Không có vé nào khớp với tìm kiếm của bạn.'
              : 'Hãy khám phá các sự kiện và đặt vé ngay!'}
          </p>
        </div>
      )}
    </div>
  );
}
