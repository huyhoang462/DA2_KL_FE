import React, { useState, useEffect, useRef } from 'react';
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
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../../utils/lib';
import { getAllCategories } from '../../../services/eventService';

const Section = ({ title, icon, children, className = '' }) => (
  <div
    className={cn(
      'border-border-default mb-4 border-b pb-4 last:mb-0 last:border-b-0 last:pb-0',
      className
    )}
  >
    <div className="mb-2.5 flex items-center gap-1.5">
      {icon}
      <h3 className="text-text-primary text-xs font-semibold tracking-wide uppercase">
        {title}
      </h3>
    </div>
    {children}
  </div>
);

const Chip = ({ label, selected, onClick, icon: Icon }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
      selected
        ? 'bg-primary text-primary-foreground border-primary'
        : 'bg-background-secondary text-text-secondary border-border-default hover:border-primary hover:text-primary'
    )}
  >
    {Icon && <Icon className="h-3 w-3" />}
    <span>{label}</span>
    {selected && <Check className="ml-0.5 h-2.5 w-2.5" />}
  </button>
);

const staticLocations = [
  { code: 79, name: 'TP.HCM' },
  { code: 1, name: 'Hà Nội' },
  { code: 48, name: 'Đà Nẵng' },
  { code: 0, name: 'Khác' },
];

const defaultFilters = {
  category: [],
  city: '',
  minPrice: 0,
  maxPrice: 5000000,
  startDate: '',
  endDate: '',
};

const getDateShortcuts = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const thisWeekend = new Date(today);
  const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
  thisWeekend.setDate(today.getDate() + daysUntilSaturday);

  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const thisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return [
    { label: 'Hôm nay', date: today.toISOString().split('T')[0] },
    { label: 'Ngày mai', date: tomorrow.toISOString().split('T')[0] },
    { label: 'Cuối tuần', date: thisWeekend.toISOString().split('T')[0] },
    { label: 'Tuần sau', date: nextWeek.toISOString().split('T')[0] },
    { label: 'Tháng này', date: thisMonth.toISOString().split('T')[0] },
  ];
};

const formatPrice = (value) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return value.toString();
};

const formatPriceInput = (value) => {
  return value === 0 ? '' : value.toLocaleString('vi-VN');
};

export default function SearchFilter({ initialFilters, onApply }) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(
    initialFilters || defaultFilters
  );
  const [priceMode, setPriceMode] = useState('range'); // 'range', 'min', 'max'

  useEffect(() => {
    setLocalFilters(initialFilters || defaultFilters);
    // Detect price mode from initial filters
    if (initialFilters?.minPrice > 0 && initialFilters?.maxPrice >= 5000000) {
      setPriceMode('min');
    } else if (
      initialFilters?.minPrice === 0 &&
      initialFilters?.maxPrice < 5000000
    ) {
      setPriceMode('max');
    } else {
      setPriceMode('range');
    }
  }, [initialFilters]);

  const { data: availableCategories = [], isLoading } = useQuery({
    queryKey: ['allCategories'],
    queryFn: getAllCategories,
    staleTime: 1000 * 60 * 5,
  });

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
      city: prev.city === cityCode ? '' : cityCode,
    }));
  };

  const handleDateShortcut = (dateStr) => {
    setLocalFilters((prev) => ({
      ...prev,
      startDate: dateStr,
      endDate: '',
    }));
  };

  const handlePriceModeChange = (mode) => {
    setPriceMode(mode);
    if (mode === 'min') {
      setLocalFilters((prev) => ({ ...prev, maxPrice: 5000000 }));
    } else if (mode === 'max') {
      setLocalFilters((prev) => ({ ...prev, minPrice: 0 }));
    }
  };

  const handlePriceChange = (field, value) => {
    const numValue = parseInt(value.replace(/\D/g, '')) || 0;
    setLocalFilters((prev) => ({ ...prev, [field]: numValue }));
  };

  const handleApply = () => {
    onApply(localFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    setLocalFilters(defaultFilters);
    setPriceMode('range');
  };

  const activeFilterCount = (() => {
    let count = 0;
    if (localFilters.category.length > 0) count++;
    if (localFilters.city) count++;
    if (localFilters.startDate || localFilters.endDate) count++;
    if (localFilters.minPrice > 0 || localFilters.maxPrice < 5000000) count++;
    return count;
  })();

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="relative gap-1.5"
        size="sm"
      >
        <Filter className="h-3.5 w-3.5" />
        <span className="hidden text-xs sm:inline">Lọc</span>
        {activeFilterCount > 0 && (
          <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold">
            {activeFilterCount}
          </span>
        )}
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Bộ lọc"
        xButton={true}
        maxWidth="max-w-lg"
      >
        <div className="flex flex-col">
          <div className="max-h-[70vh] overflow-y-auto">
            {/* Categories */}
            <Section
              title="Thể loại"
              icon={<Tag className="text-primary h-3.5 w-3.5" />}
            >
              {isLoading ? (
                <div className="text-text-secondary flex items-center gap-2 py-4 text-xs">
                  <div className="border-primary h-3 w-3 animate-spin rounded-full border-2 border-t-transparent" />
                  <span>Đang tải...</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {availableCategories.map((cat) => (
                    <Chip
                      key={cat.id}
                      label={cat.name}
                      selected={localFilters.category.includes(cat.id)}
                      onClick={() => handleToggleCategory(cat.id)}
                    />
                  ))}
                </div>
              )}
            </Section>

            {/* Location */}
            <Section
              title="Địa điểm"
              icon={<MapPin className="text-primary h-3.5 w-3.5" />}
            >
              <div className="flex flex-wrap gap-1.5">
                {staticLocations.map((location) => (
                  <Chip
                    key={location.code}
                    label={location.name}
                    icon={MapPin}
                    selected={localFilters.city === location.code}
                    onClick={() => handleLocationSelect(location.code)}
                  />
                ))}
              </div>
            </Section>

            {/* Date Range */}
            <Section
              title="Thời gian"
              icon={<Calendar className="text-primary h-3.5 w-3.5" />}
            >
              {/* Quick Select */}
              <div className="mb-3 flex flex-wrap gap-1.5">
                {getDateShortcuts().map((shortcut) => (
                  <button
                    key={shortcut.label}
                    type="button"
                    onClick={() => handleDateShortcut(shortcut.date)}
                    className={cn(
                      'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                      localFilters.startDate === shortcut.date
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background-secondary text-text-secondary border-border-default hover:border-primary'
                    )}
                  >
                    {shortcut.label}
                  </button>
                ))}
              </div>

              {/* Custom Date Range */}
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={localFilters.startDate}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  placeholder="Từ ngày"
                  inputClassName="text-xs h-8"
                />
                <Input
                  type="date"
                  value={localFilters.endDate}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  placeholder="Đến ngày"
                  inputClassName="text-xs h-8"
                />
              </div>
            </Section>

            {/* Price Range */}
            <Section
              title="Khoảng giá"
              icon={<DollarSign className="text-primary h-3.5 w-3.5" />}
            >
              {/* Price Mode Toggle */}
              <div className="mb-3 flex gap-1">
                <button
                  type="button"
                  onClick={() => handlePriceModeChange('range')}
                  className={cn(
                    'flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors',
                    priceMode === 'range'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background-secondary text-text-secondary border-border-default'
                  )}
                >
                  Khoảng
                </button>
                <button
                  type="button"
                  onClick={() => handlePriceModeChange('min')}
                  className={cn(
                    'flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors',
                    priceMode === 'min'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background-secondary text-text-secondary border-border-default'
                  )}
                >
                  Từ ≥
                </button>
                <button
                  type="button"
                  onClick={() => handlePriceModeChange('max')}
                  className={cn(
                    'flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors',
                    priceMode === 'max'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background-secondary text-text-secondary border-border-default'
                  )}
                >
                  Đến ≤
                </button>
              </div>

              {/* Price Inputs */}
              {priceMode === 'range' && (
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="text"
                    value={formatPriceInput(localFilters.minPrice)}
                    onChange={(e) =>
                      handlePriceChange('minPrice', e.target.value)
                    }
                    placeholder="Từ"
                    inputClassName="text-xs h-8"
                  />
                  <Input
                    type="text"
                    value={formatPriceInput(localFilters.maxPrice)}
                    onChange={(e) =>
                      handlePriceChange('maxPrice', e.target.value)
                    }
                    placeholder="Đến"
                    inputClassName="text-xs h-8"
                  />
                </div>
              )}

              {priceMode === 'min' && (
                <Input
                  type="text"
                  value={formatPriceInput(localFilters.minPrice)}
                  onChange={(e) =>
                    handlePriceChange('minPrice', e.target.value)
                  }
                  placeholder="Giá từ"
                  inputClassName="text-xs h-8"
                />
              )}

              {priceMode === 'max' && (
                <Input
                  type="text"
                  value={formatPriceInput(localFilters.maxPrice)}
                  onChange={(e) =>
                    handlePriceChange('maxPrice', e.target.value)
                  }
                  placeholder="Giá đến"
                  inputClassName="text-xs h-8"
                />
              )}

              {/* Quick Price Options */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[0, 100000, 200000, 500000, 1000000].map((price) => (
                  <button
                    key={price}
                    type="button"
                    onClick={() => {
                      if (priceMode === 'min' || priceMode === 'range') {
                        setLocalFilters((prev) => ({
                          ...prev,
                          minPrice: price,
                        }));
                      }
                      if (priceMode === 'max' || priceMode === 'range') {
                        setLocalFilters((prev) => ({
                          ...prev,
                          maxPrice: price,
                        }));
                      }
                    }}
                    className="border-border-default bg-background-secondary text-text-secondary hover:border-primary hover:text-primary rounded-md border px-2 py-0.5 text-xs transition-colors"
                  >
                    {price === 0 ? 'Miễn phí' : formatPrice(price)}
                  </button>
                ))}
              </div>
            </Section>
          </div>

          {/* Footer */}
          <div className="border-border-default mt-4 flex items-center justify-between gap-2 border-t pt-3">
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="h-8 text-xs"
            >
              <X className="mr-1 h-3 w-3" />
              Xóa
            </Button>
            <Button
              onClick={handleApply}
              size="sm"
              className="h-8 px-6 text-xs"
            >
              Áp dụng
              {activeFilterCount > 0 && ` (${activeFilterCount})`}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
