import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import {
  Filter,
  Check,
  Calendar,
  MapPin,
  Tag,
  DollarSign,
  X,
  AlertCircle,
} from 'lucide-react';
import { cn } from '../../../utils/lib';
import { getAllCategories } from '../../../services/eventService';

const Section = ({ title, icon, children, className = '' }) => (
  <div
    className={cn(
      'border-border-default mb-4 border-b pb-4 last:border-b-0',
      className
    )}
  >
    <div className="mb-3 flex items-center gap-2">
      {icon}
      <h3 className="text-text-primary text-sm font-semibold">{title}</h3>
    </div>
    {children}
  </div>
);

const CategoryChip = ({ label, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-all duration-200',
      selected
        ? 'bg-primary text-primary-foreground border-primary'
        : 'bg-background-secondary text-text-secondary border-border-default hover:border-primary hover:text-primary'
    )}
  >
    {selected && <Check className="h-3 w-3" />}
    <span>{label}</span>
  </button>
);

const LocationOption = ({ location, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex w-full cursor-pointer items-center gap-2 rounded-md border p-2 text-left text-xs transition-all duration-200',
      selected
        ? 'bg-primary text-primary-foreground border-primary'
        : 'bg-background-secondary text-text-primary border-border-default hover:border-primary'
    )}
  >
    <MapPin className="h-3 w-3 flex-shrink-0 text-current" />
    <span className="truncate font-medium">{location.name}</span>
    {selected && <Check className="ml-auto h-3 w-3 flex-shrink-0" />}
  </button>
);

const ErrorMessage = ({ message }) => (
  <div className="mt-1 flex items-center gap-1.5">
    <AlertCircle className="text-destructive h-3 w-3 flex-shrink-0" />
    <span className="text-destructive text-xs">{message}</span>
  </div>
);

const staticLocations = [
  { code: 79, name: 'TP. HCM' },
  { code: 1, name: 'Hà Nội' },
  { code: 48, name: 'Đà Nẵng' },
  { code: 0, name: 'Khác' },
];

const defaultFilters = {
  category: [],
  cityCode: '',
  minPrice: 0,
  maxPrice: 5000000,
  startDate: '',
  endDate: '',
};

export default function SearchFilter({ initialFilters, onApply }) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(
    initialFilters || defaultFilters
  );
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setLocalFilters(initialFilters || defaultFilters);
  }, [initialFilters]);

  const { data: availableCategories = [], isLoading } = useQuery({
    queryKey: ['allCategories'],
    queryFn: getAllCategories,
    staleTime: 1000 * 60 * 5,
  });

  const validateFilters = (filters) => {
    const newErrors = {};

    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      if (startDate > endDate) {
        newErrors.dateRange = 'Ngày bắt đầu phải trước ngày kết thúc';
      }
    }

    if (filters.minPrice < 0) {
      newErrors.minPrice = 'Giá không được âm';
    }

    if (filters.maxPrice < 0) {
      newErrors.maxPrice = 'Giá không được âm';
    }

    if (filters.maxPrice > 10000000) {
      newErrors.maxPrice = 'Giá tối đa là 10 triệu VNĐ';
    }

    if (filters.minPrice >= filters.maxPrice && filters.maxPrice > 0) {
      newErrors.priceRange = 'Giá từ phải nhỏ hơn giá đến';
    }

    return Object.fromEntries(
      Object.entries(newErrors).filter(([_, value]) => value !== undefined)
    );
  };
  const handleToggleCategory = (categoryId) => {
    setLocalFilters((prev) => {
      const newCategories = prev.category.includes(categoryId)
        ? prev.category.filter((c) => c !== categoryId)
        : [...prev.category, categoryId];
      return { ...prev, category: newCategories };
    });
  };

  const handleLocationSelect = (cityCode) => {
    setLocalFilters((prev) => ({
      ...prev,
      cityCode: prev.cityCode === cityCode ? '' : cityCode,
    }));
  };

  const handleDateChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);

    if (errors.dateRange) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.dateRange;
        return newErrors;
      });
    }

    const newErrors = validateFilters(newFilters);

    setErrors((prev) => {
      const filteredNewErrors = Object.fromEntries(
        Object.entries(newErrors).filter(([_, value]) => value !== undefined)
      );
      return { ...prev, ...filteredNewErrors };
    });
  };

  const handlePriceChange = (field, value) => {
    const numValue = Number(value) || 0;
    const newFilters = { ...localFilters, [field]: numValue };
    setLocalFilters(newFilters);

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      delete newErrors.priceRange;
      return newErrors;
    });

    const newErrors = validateFilters(newFilters);

    setErrors((prev) => {
      const filteredNewErrors = Object.fromEntries(
        Object.entries(newErrors).filter(([_, value]) => value !== undefined)
      );
      return { ...prev, ...filteredNewErrors };
    });
  };

  const handleApply = () => {
    const validationErrors = validateFilters(localFilters);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onApply(localFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    setLocalFilters(defaultFilters);
    setErrors({});
    onApply(defaultFilters);
    setIsOpen(false);
  };

  const activeFilterCount = Object.entries(localFilters).filter(
    ([key, value]) => {
      if (key === 'minPrice' && value === 0) return false;
      if (key === 'maxPrice' && value === 5000000) return false;
      if (Array.isArray(value)) return value.length > 0;
      return !!value;
    }
  ).length;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="relative flex items-center gap-2"
        size="sm"
      >
        <Filter className="h-4 w-4" />
        <span>Lọc</span>
        {activeFilterCount > 0 && (
          <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold">
            {activeFilterCount}
          </span>
        )}
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Bộ lọc tìm kiếm"
        xButton={true}
        maxWidth="max-w-xl"
      >
        <div className="flex w-full flex-col">
          <div className="max-h-96 space-y-0 overflow-y-auto">
            <Section
              title="Thể loại"
              icon={<Tag className="text-primary h-4 w-4" />}
            >
              {isLoading ? (
                <div className="text-text-secondary flex items-center gap-2 text-sm">
                  <div className="border-primary h-3 w-3 animate-spin rounded-full border-2 border-t-transparent" />
                  <span>Đang tải...</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {availableCategories.map((cat) => (
                    <CategoryChip
                      key={cat.id}
                      label={cat.name}
                      selected={localFilters.category.includes(cat.id)}
                      onClick={() => handleToggleCategory(cat.id)}
                    />
                  ))}
                </div>
              )}
            </Section>

            {/* Địa điểm */}
            <Section
              title="Thành phố"
              icon={<MapPin className="text-primary h-4 w-4" />}
            >
              <div className="grid grid-cols-2 gap-2">
                {staticLocations.map((location) => (
                  <LocationOption
                    key={location.code}
                    location={location}
                    selected={localFilters.cityCode === location.code}
                    onClick={() => handleLocationSelect(location.code)}
                  />
                ))}
              </div>
            </Section>

            {/* Thời gian */}
            <Section
              title="Thời gian"
              icon={<Calendar className="text-primary h-4 w-4" />}
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Input
                    type="date"
                    value={localFilters.startDate}
                    onChange={(e) =>
                      handleDateChange('startDate', e.target.value)
                    }
                    inputClassName={cn(
                      'text-xs',
                      errors.dateRange &&
                        'border-destructive focus:border-destructive'
                    )}
                  />
                </div>
                <div className="space-y-1">
                  <Input
                    type="date"
                    value={localFilters.endDate}
                    onChange={(e) =>
                      handleDateChange('endDate', e.target.value)
                    }
                    inputClassName={cn(
                      'text-xs',
                      errors.dateRange &&
                        'border-destructive focus:border-destructive'
                    )}
                  />
                </div>
              </div>
              {errors.dateRange && <ErrorMessage message={errors.dateRange} />}
            </Section>

            {/* Khoảng giá */}
            <Section
              title="Khoảng giá"
              icon={<DollarSign className="text-primary h-4 w-4" />}
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Input
                    type="number"
                    min="0"
                    value={localFilters.minPrice}
                    onChange={(e) =>
                      handlePriceChange('minPrice', e.target.value)
                    }
                    placeholder="0"
                    inputClassName={cn(
                      'text-xs',
                      (errors.minPrice || errors.priceRange) &&
                        'border-destructive focus:border-destructive'
                    )}
                  />
                  {errors.minPrice && (
                    <ErrorMessage message={errors.minPrice} />
                  )}
                </div>
                <div className="space-y-1">
                  <Input
                    type="number"
                    min="0"
                    max="10000000"
                    value={localFilters.maxPrice}
                    onChange={(e) =>
                      handlePriceChange('maxPrice', e.target.value)
                    }
                    placeholder="5,000,000"
                    inputClassName={cn(
                      'text-xs',
                      (errors.maxPrice || errors.priceRange) &&
                        'border-destructive focus:border-destructive'
                    )}
                  />
                  {errors.maxPrice && (
                    <ErrorMessage message={errors.maxPrice} />
                  )}
                </div>
              </div>
              {errors.priceRange && (
                <ErrorMessage message={errors.priceRange} />
              )}
            </Section>
          </div>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="text-text-secondary text-xs"
            >
              <X className="mr-1 h-3 w-3" />
              Xóa tất cả
            </Button>
            <Button
              onClick={handleApply}
              size="sm"
              className="px-6 text-xs"
              disabled={Object.keys(errors).length > 0}
            >
              Áp dụng
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
