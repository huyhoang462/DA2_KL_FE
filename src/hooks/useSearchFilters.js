import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

const parseUrlParams = (params) => {
  return {
    q: params.get('q') || '',
    category: params.getAll('category'),
    cityCode: params.get('cityCode') || '',
    districtCode: params.get('districtCode') || '',
    minPrice: params.get('minPrice') || '0',
    maxPrice: params.get('maxPrice') || '5000000',
    sortBy: params.get('sortBy') || 'date_asc',
    startDate: params.get('startDate') || '',
    endDate: params.get('endDate') || '',
  };
};

export default function useSearchFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState(() => parseUrlParams(searchParams));

  useEffect(() => {
    setFilters(parseUrlParams(searchParams));
  }, [searchParams]);

  const updateFilters = useCallback(
    (newValues, options = { replace: true }) => {
      setSearchParams(
        (prevParams) => {
          const newParams = new URLSearchParams(prevParams);

          Object.entries(newValues).forEach(([key, value]) => {
            newParams.delete(key);

            if (Array.isArray(value)) {
              value.forEach((v) => newParams.append(key, v));
            } else if (value) {
              newParams.set(key, value);
            }
          });
          return newParams;
        },
        { replace: options.replace }
      );
    },
    [setSearchParams]
  );

  const resetFilters = useCallback(() => {
    const newParams = new URLSearchParams();

    if (filters.q) {
      newParams.set('q', filters.q);
    }
    setSearchParams(newParams, { replace: true });
  }, [filters.q, setSearchParams]);

  const { data: availableCategories = [] } = useQuery({
    queryKey: ['availableCategories'],
  });
  const { data: availableLocations = [] } = useQuery({
    queryKey: ['availableLocations'],
  });

  return {
    filters,
    updateFilters,
    resetFilters,
    availableCategories,
    availableLocations,
  };
}
