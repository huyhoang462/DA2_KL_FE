import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { X, Loader2 } from 'lucide-react';

import SearchFilter from '../../components/features/search/SearchFilter';
import EventCardSkeleton from '../../components/ui/EventCardSkeleton';
import { searchEvents } from '../../services/searchService';
import EventCard from '../../components/ui/EventCard';
import Button from '../../components/ui/Button';

const DEFAULT_FILTERS = {
  q: '',
  category: [],
  city: '',
  minPrice: 0,
  maxPrice: 5000000,
  startDate: '',
  endDate: '',
  sortBy: 'date_asc',
  page: 1,
  limit: 12,
};

const parseUrlToFilters = (searchParams) => ({
  q: searchParams.get('query') || '',
  category: searchParams.get('category')?.split(',').filter(Boolean) || [],
  city: searchParams.get('city') ? parseInt(searchParams.get('city')) : '',
  minPrice: parseInt(searchParams.get('minPrice')) || 0,
  maxPrice: parseInt(searchParams.get('maxPrice')) || 5000000,
  startDate: searchParams.get('startDate') || '',
  endDate: searchParams.get('endDate') || '',
  sortBy: searchParams.get('sortBy') || 'date_asc',
  page: parseInt(searchParams.get('page')) || 1,
  limit: 12,
});

const filtersToUrl = (filters) => {
  const params = new URLSearchParams();
  if (filters.q) params.set('query', filters.q);
  if (filters.category.length)
    params.set('category', filters.category.join(','));
  if (filters.city) params.set('city', filters.city.toString());
  if (filters.minPrice > 0) params.set('minPrice', filters.minPrice.toString());
  if (filters.maxPrice < 5000000)
    params.set('maxPrice', filters.maxPrice.toString());
  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate) params.set('endDate', filters.endDate);
  if (filters.sortBy && filters.sortBy !== 'date_asc')
    params.set('sortBy', filters.sortBy);
  if (filters.page > 1) params.set('page', filters.page.toString());
  return params;
};

const SORT_OPTIONS = [
  { value: 'date_asc', label: 'Ngày tăng dần' },
  { value: 'date_desc', label: 'Ngày giảm dần' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
];

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
    queryKey: ['searchEvents', filters],
    queryFn: () => searchEvents(filters),
    keepPreviousData: true,
  });

  const events = data?.data || [];
  const pagination = data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  };

  // Handlers
  const handleApplyFilters = (newFilters) =>
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));

  const handleSortChange = (sortBy) =>
    setFilters((prev) => ({ ...prev, sortBy, page: 1 }));

  const handleClearQuery = () =>
    setFilters((prev) => ({ ...prev, q: '', page: 1 }));

  const handleClearFilters = () =>
    setFilters((prev) => ({
      ...prev,
      ...DEFAULT_FILTERS,
      q: prev.q,
      sortBy: prev.sortBy,
      page: 1,
    }));

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters =
    filters.category.length > 0 ||
    filters.city ||
    filters.minPrice > 0 ||
    filters.maxPrice < 5000000 ||
    filters.startDate ||
    filters.endDate;

  return (
    <div className="bg-background-primary min-h-[calc(100vh-64px)]">
      <main className="container mx-auto p-4">
        <div className="mb-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-text-primary text-2xl font-bold">
                {filters.q ? (
                  <>
                    Kết quả tìm kiếm cho{' '}
                    <span className="text-primary">"{filters.q}"</span>
                  </>
                ) : (
                  'Tất cả sự kiện'
                )}
              </h1>
              <p className="text-text-secondary mt-1 text-sm">
                {pagination.totalItems > 0
                  ? `Tìm thấy ${pagination.totalItems} sự kiện`
                  : 'Không tìm thấy sự kiện'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <select
                value={filters.sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-background-secondary border-border-default text-text-primary focus:border-primary focus:ring-primary cursor-pointer rounded-lg border px-3 py-2 text-sm transition focus:ring-1 focus:outline-none"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <SearchFilter
                initialFilters={filters}
                onApply={handleApplyFilters}
              />
            </div>
          </div>

          {/* Active Filters */}
          {(filters.q || hasActiveFilters) && (
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
          )}
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {isLoading ? (
            [...Array(12)].map((_, index) => (
              <EventCardSkeleton key={`skeleton-${index}`} />
            ))
          ) : events.length > 0 ? (
            events.map((event) => <EventCard key={event.id} event={event} />)
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

        {/* Pagination */}
        {events.length > 0 && pagination.totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <Button
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={filters.page === 1}
              variant="outline"
              className="px-4 py-2"
            >
              Trước
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(pagination.totalPages)].map((_, index) => {
                const pageNum = index + 1;
                if (
                  pageNum === 1 ||
                  pageNum === pagination.totalPages ||
                  (pageNum >= filters.page - 1 && pageNum <= filters.page + 1)
                ) {
                  return (
                    <Button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      variant={filters.page === pageNum ? 'primary' : 'outline'}
                      className="min-w-[40px] px-3 py-2"
                    >
                      {pageNum}
                    </Button>
                  );
                } else if (
                  pageNum === filters.page - 2 ||
                  pageNum === filters.page + 2
                ) {
                  return (
                    <span key={pageNum} className="text-text-secondary px-2">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>
            <Button
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={filters.page === pagination.totalPages}
              variant="outline"
              className="px-4 py-2"
            >
              Sau
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
