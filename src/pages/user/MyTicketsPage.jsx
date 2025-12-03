import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { mockTickets } from '../../utils/mockData';
import TicketCard from '../../components/features/ticket/TicketCard';
import Input from '../../components/ui/Input';

const filters = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Sắp diễn ra', value: 'upcoming' },
  { label: 'Đang diễn ra', value: 'now' },
  { label: 'Đã kết thúc', value: 'past' },
];

const statusToFilterMap = {
  active: 'upcoming',
  checkedIn: 'now',
  temporarilyExited: 'now',
  consumed: 'past',
  expired: 'past',
  cancelled: 'past',
};

export default function MyTicketsPage() {
  const [activeFilter, setActiveFilter] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTickets = useMemo(() => {
    return mockTickets.filter((ticket) => {
      const matchesFilter =
        activeFilter === 'all' ||
        statusToFilterMap[ticket.status] === activeFilter;

      const matchesSearch =
        searchTerm === '' ||
        ticket.eventName.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-row gap-4 sm:items-center sm:justify-between">
        <div className="relative w-full">
          <Search className="text-text-placeholder absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Tìm theo tên sự kiện..."
            inputClassName="p-2 pl-8 "
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="order-1 w-auto md:order-2">
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="border-border-default bg-background-secondary placeholder:text-muted-foreground focus:ring-none focus:border-primary w-full rounded-md border px-3 py-2.5 text-sm focus:border-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-80"
          >
            {filters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredTickets.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      ) : (
        <div className="border-border-dashed bg-background-secondary flex flex-col items-center justify-center rounded-lg border p-12 text-center">
          <h3 className="text-text-primary text-lg font-semibold">
            Không tìm thấy vé
          </h3>
          <p className="text-text-secondary mt-1 text-sm">
            {searchTerm
              ? 'Không có vé nào khớp với tìm kiếm của bạn.'
              : 'Bạn chưa có vé nào trong mục này.'}
          </p>
        </div>
      )}
    </div>
  );
}
