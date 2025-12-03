import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllCategories } from '../../../services/eventService';

export default function CategoryInput({ value, onChange, disabled, error }) {
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div>
      <label
        htmlFor="category-select"
        className="text-text-secondary mb-2 block text-sm font-medium"
      >
        Thể loại
      </label>
      <select
        id="category-select"
        value={value}
        onChange={onChange}
        disabled={disabled || isLoadingCategories}
        className={`bg-background-secondary text-text-primary placeholder-text-placeholder focus:border-primary block w-full rounded-lg border p-2.5 transition outline-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-80 ${error ? 'border-destructive' : 'border-border-default'}`}
      >
        <option value="">
          {isLoadingCategories ? 'Đang tải thể loại...' : 'Chọn một thể loại'}
        </option>

        {categories?.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      {error && <div className="text-destructive mt-1 text-xs">{error}</div>}
    </div>
  );
}
