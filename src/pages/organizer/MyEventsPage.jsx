import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { mockEvents } from '../../utils/mockData';
import MyEventCard from '../../components/features/event/MyEventCard';
import Input from '../../components/ui/Input';

const filters = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Nháp', value: 'draft' },
  { label: 'Chờ duyệt', value: 'pending' },
  { label: 'Sắp diễn ra', value: 'upcoming' },
  { label: 'Đang diễn ra', value: 'ongoing' },
  { label: 'Đã kết thúc', value: 'completed' },
  { label: 'Bị từ chối', value: 'rejected' },
  { label: 'Đã hủy', value: 'cancelled' },
];

export default function MyEventsPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = useMemo(() => {
    return mockEvents.filter((event) => {
      const matchesFilter =
        activeFilter === 'all' || event.status === activeFilter;

      const matchesSearch =
        searchTerm === '' ||
        event.name.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchTerm]);

  return (
    <div className="space-y-6 pt-6">
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
            className="border-border-default bg-background-secondary placeholder:text-muted-foreground focus:ring-none focus:border-primary w-full rounded-md border px-3 py-2.5 text-sm focus:border-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {filters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredEvents.map((event) => (
            <MyEventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="border-border-dashed bg-background-secondary flex flex-col items-center justify-center rounded-lg border p-12 text-center">
          <h3 className="text-text-primary text-lg font-semibold">
            Không tìm thấy sự kiện
          </h3>
          <p className="text-text-secondary mt-1 text-sm">
            {searchTerm
              ? 'Không có sự kiện nào khớp với tìm kiếm của bạn.'
              : 'Bạn chưa tạo sự kiện nào trong mục này.'}
          </p>
        </div>
      )}
    </div>
  );
}
