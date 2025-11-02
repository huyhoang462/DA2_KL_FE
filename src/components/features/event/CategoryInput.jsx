import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllCategories } from '../../../services/eventService';

export default function CategoryInput({ value, onChange, disabled }) {
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
        id="category-select" // Thêm id để label có thể liên kết
        // `value` nhận từ props để component được kiểm soát từ bên ngoài
        value={value}
        // `onChange` nhận từ props để thông báo thay đổi cho component cha
        onChange={onChange}
        // Vô hiệu hóa khi component cha yêu cầu, hoặc khi đang tải dữ liệu
        disabled={disabled || isLoadingCategories}
        className="bg-background-secondary text-text-primary placeholder-text-placeholder focus:border-primary border-border-default block w-full rounded-lg border p-2.5 transition outline-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">
          {isLoadingCategories ? 'Đang tải thể loại...' : 'Chọn một thể loại'}
        </option>

        {/* Render danh sách các option từ dữ liệu fetch được */}
        {categories?.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
}
