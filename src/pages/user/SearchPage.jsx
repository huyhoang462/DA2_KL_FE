import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { searchService } from '../../services/searchService';
import SearchFilter from '../../components/features/search/SearchFilter';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorDisplay from '../../components/ui/ErrorDisplay';
import EventCard from '../../components/features/search/EventCard';

const FilterTag = ({ label, onRemove }) => (
  <div className="bg-foreground text-text-primary flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium shadow-sm">
    <span className="truncate">{label}</span>
    <button
      onClick={onRemove}
      className="text-text-secondary hover:text-destructive transition-colors"
      aria-label={`Remove filter: ${label}`}
    >
      ✕
    </button>
  </div>
);
export default function SearchPage() {
  const [params, setParams] = useSearchParams();

  const query = params.get('query') || '';

  const [filters, setFilters] = useState({
    dateFrom: params.get('dateFrom') || '',
    dateTo: params.get('dateTo') || '',
    locations: params.get('locations')
      ? params.get('locations').split(',')
      : [],
    categories: params.get('categories')
      ? params.get('categories').split(',')
      : [],
    priceRange: params.get('price')
      ? params.get('price').split('-').map(Number)
      : [0, 5000000],
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['searchResults', query, filters],
    queryFn: ({ pageParam }) =>
      searchService.searchEvents({
        query,
        filters,
        pageParam,
        pageSize: 10,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const updateURL = useCallback(
    (newFilters) => {
      const newParams = new URLSearchParams();

      if (query) newParams.set('query', query);
      if (newFilters.dateFrom) newParams.set('dateFrom', newFilters.dateFrom);
      if (newFilters.dateTo) newParams.set('dateTo', newFilters.dateTo);
      if (newFilters.locations.length > 0)
        newParams.set('locations', newFilters.locations.join(','));
      if (newFilters.categories.length > 0)
        newParams.set('categories', newFilters.categories.join(','));
      if (
        newFilters.priceRange[0] !== 0 ||
        newFilters.priceRange[1] !== 5000000
      )
        newParams.set('price', newFilters.priceRange.join('-'));

      setParams(newParams, { replace: true });
    },
    [query, setParams]
  );

  const handleApplyFilters = useCallback(
    (newFilters) => {
      setFilters(newFilters);
      updateURL(newFilters);
    },
    [updateURL]
  );

  const handleResetFilters = useCallback(() => {
    const emptyFilters = {
      dateFrom: '',
      dateTo: '',
      locations: [],
      categories: [],
      priceRange: [0, 5000000],
    };
    setFilters(emptyFilters);
    updateURL(emptyFilters);
  }, [updateURL]);

  const handleRemoveSingleFilter = useCallback(
    (key, value) => {
      setFilters((prevFilters) => {
        const updated = { ...prevFilters };
        if (key === 'locations' || key === 'categories') {
          updated[key] = updated[key].filter((v) => v !== value);
        } else if (key === 'priceRange') {
          updated.priceRange = [0, 5000000];
        } else {
          updated[key] = '';
        }
        updateURL(updated);
        return updated;
      });
    },
    [updateURL]
  );

  const loaderRef = useRef(null);
  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '20px',
      threshold: 1.0,
    });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loaderRef, handleObserver]);

  const allEvents = data?.pages.flatMap((page) => page.items) || [];
  const totalResults = data?.pages[0]?.totalCount || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* FILTER BUTTON & SEARCH QUERY */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-text-secondary text-base">
          {totalResults > 0 ? (
            <span className="text-text-primary font-semibold">
              {totalResults}
            </span>
          ) : (
            'Không có'
          )}{' '}
          kết quả cho{' '}
          {query && (
            <span className="text-text-primary font-semibold">"{query}"</span>
          )}
        </div>
        <SearchFilter
          initialFilters={filters}
          searchQuery={query}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          onRemoveSingleFilter={handleRemoveSingleFilter}
        />
      </div>

      {/* HIỂN THỊ CÁC TAG LỌC ĐANG CHỌN */}
      <div className="mb-6 flex flex-wrap gap-2">
        {filters.locations.map((loc) => (
          <FilterTag
            key={`loc-${loc}`}
            label={loc}
            onRemove={() => handleRemoveSingleFilter('locations', loc)}
          />
        ))}
        {filters.categories.map((cat) => (
          <FilterTag
            key={`cat-${cat}`}
            label={cat}
            onRemove={() => handleRemoveSingleFilter('categories', cat)}
          />
        ))}
        {filters.dateFrom && (
          <FilterTag
            label={`Từ ${filters.dateFrom}`}
            onRemove={() => handleRemoveSingleFilter('dateFrom')}
          />
        )}
        {filters.dateTo && (
          <FilterTag
            label={`Đến ${filters.dateTo}`}
            onRemove={() => handleRemoveSingleFilter('dateTo')}
          />
        )}
        {(filters.priceRange[0] !== 0 || filters.priceRange[1] !== 5000000) && (
          <FilterTag
            label={`${filters.priceRange[0].toLocaleString()}đ - ${filters.priceRange[1].toLocaleString()}đ`}
            onRemove={() => handleRemoveSingleFilter('priceRange')}
          />
        )}
      </div>

      {/* HIỂN THỊ KẾT QUẢ */}
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : isError ? (
        <ErrorDisplay
          message={error?.message || 'Đã có lỗi khi tải kết quả tìm kiếm.'}
        />
      ) : allEvents.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {allEvents.map((eventItem) => (
            <EventCard key={eventItem.id} event={eventItem} />
          ))}
        </div>
      ) : (
        <div className="border-border-dashed bg-background-secondary flex flex-col items-center justify-center rounded-lg border p-12 text-center">
          <h3 className="text-text-primary text-lg font-semibold">
            Không tìm thấy sự kiện
          </h3>
          <p className="text-text-secondary mt-1 text-sm">
            {query
              ? `Không có sự kiện nào khớp với "${query}"`
              : 'Vui lòng nhập từ khóa tìm kiếm.'}
          </p>
        </div>
      )}

      {/* Loader cho Infinite Scroll */}
      <div ref={loaderRef} className="py-4">
        {isFetchingNextPage && (
          <div className="flex h-20 items-center justify-center">
            <LoadingSpinner />
          </div>
        )}
        {!hasNextPage && !isFetchingNextPage && allEvents.length > 0 && (
          <p className="text-text-secondary mt-4 text-center text-sm">
            Bạn đã xem hết các sự kiện.
          </p>
        )}
      </div>
    </div>
  );
}
