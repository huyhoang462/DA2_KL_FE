import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';

import SearchFilter from '../../components/features/search/SearchFilter';
import EventCardSkeleton from '../../components/ui/EventCardSkeleton';
import { searchEvents } from '../../services/searchService';
import EventCard from '../../components/ui/EventCard';

const DEFAULT_FILTERS = {
  q: '',
  category: [],
  cityCode: '',
  minPrice: 0,
  maxPrice: 5000000,
  startDate: '',
  endDate: '',
};

const parseUrlToFilters = (searchParams) => ({
  q: searchParams.get('query') || '',
  category: searchParams.get('category')?.split(',').filter(Boolean) || [],
  cityCode: searchParams.get('city') || '',
  minPrice: parseInt(searchParams.get('minPrice')) || 0,
  maxPrice: parseInt(searchParams.get('maxPrice')) || 5000000,
  startDate: searchParams.get('startDate') || '',
  endDate: searchParams.get('endDate') || '',
});

const filtersToUrl = (filters) => {
  const params = new URLSearchParams();
  if (filters.q) params.set('query', filters.q);
  if (filters.category.length)
    params.set('category', filters.category.join(','));
  if (filters.cityCode) params.set('city', filters.cityCode);
  if (filters.minPrice > 0) params.set('minPrice', filters.minPrice.toString());
  if (filters.maxPrice < 5000000)
    params.set('maxPrice', filters.maxPrice.toString());
  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate) params.set('endDate', filters.endDate);
  return params;
};

const ClearButton = ({ onClick, children, className = '' }) => (
  <button
    onClick={onClick}
    className={`bg-background-secondary text-text-secondary hover:bg-destructive/10 hover:text-destructive border-border-default flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${className}`}
  >
    <X className="h-3 w-3" />
    <span>{children}</span>
  </button>
);

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => parseUrlToFilters(searchParams));

  useEffect(() => {
    setSearchParams(filtersToUrl(filters), { replace: true });
  }, [filters, setSearchParams]);

  useEffect(() => {
    const newFilters = parseUrlToFilters(searchParams);
    setFilters((prev) =>
      JSON.stringify(prev) === JSON.stringify(newFilters) ? prev : newFilters
    );
  }, [searchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ['searchResults', filters],
    queryFn: () => searchEvents(filters),
    placeholderData: (prev) => prev,
  });

  // Handlers
  const handleApplyFilters = (newFilters) =>
    setFilters((prev) => ({ ...prev, ...newFilters }));

  const handleClearQuery = () => setFilters((prev) => ({ ...prev, q: '' }));

  const handleClearFilters = () =>
    setFilters((prev) => ({ ...prev, ...DEFAULT_FILTERS, q: prev.q }));

  const handleClearAll = () => setFilters(DEFAULT_FILTERS);

  const hasActiveFilters =
    filters.category.length > 0 ||
    filters.cityCode ||
    filters.minPrice > 0 ||
    filters.maxPrice < 5000000 ||
    filters.startDate ||
    filters.endDate;

  return (
    <div className="bg-background-primary min-h-[calc(100vh-64px)]">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-text-primary text-2xl font-bold">
              Kết quả tìm kiếm cho{' '}
              <span className="text-primary">
                {filters.q ? `"${filters.q}"` : ''}
              </span>
            </h1>
            <SearchFilter
              initialFilters={filters}
              onApply={handleApplyFilters}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {filters.q && (
                <ClearButton onClick={handleClearQuery}>
                  {filters.q}
                </ClearButton>
              )}

              {hasActiveFilters && (
                <ClearButton onClick={handleClearFilters}>Bộ lọc</ClearButton>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {isLoading ? (
            [...Array(8)].map((_, index) => (
              <EventCardSkeleton key={`search-skeleton-${index}`} />
            ))
          ) : data?.events?.length > 0 ? (
            data.events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            <div className="col-span-full">
              <div className="bg-background-secondary text-text-secondary border-border-default rounded-lg border-2 border-dashed py-20 text-center">
                <div className="mb-2 text-lg font-medium">
                  Không tìm thấy sự kiện phù hợp
                </div>
                <div className="text-sm opacity-75">
                  {filters.q
                    ? `Không có kết quả cho "${filters.q}". Thử tìm kiếm với từ khóa khác.`
                    : 'Thử điều chỉnh bộ lọc để tìm thêm sự kiện.'}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
