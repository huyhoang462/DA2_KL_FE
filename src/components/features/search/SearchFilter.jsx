import React, { useState, useEffect } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import Modal from '../../ui/Modal';
import { Filter, Check } from 'lucide-react';
import Button from '../../ui/Button';
import { cn } from '../../../utils/lib';

import { searchService } from '../../../services/searchService';
import { useQuery } from '@tanstack/react-query';

const Section = ({ title, children }) => (
  <div className="mb-6 last:mb-0">
    <h3 className="border-border-default text-text-primary mb-3 border-b pb-2 text-sm font-semibold">
      {title}
    </h3>
    {children}
  </div>
);

const CheckboxRow = ({ label, checked, onToggle }) => (
  <label className="text-text-primary flex cursor-pointer items-center gap-2 text-sm select-none">
    <div
      className={cn(
        'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border',
        checked
          ? 'border-primary bg-primary'
          : 'border-border-default bg-background-secondary'
      )}
      onClick={onToggle}
    >
      {checked && <Check className="text-primary-foreground h-4 w-4" />}
    </div>
    {label}
  </label>
);

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

const defaultFilters = {
  dateFrom: '',
  dateTo: '',
  locations: [],
  categories: [],
  priceRange: [0, 5000000],
};

export default function SearchFilter({ initialFilters, onApply, onReset }) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(initialFilters);

  const { data: availableCategories = [] } = useQuery({
    queryKey: ['availableCategories'],
    queryFn: searchService.getCategories,
  });

  const { data: availableLocations = [] } = useQuery({
    queryKey: ['availableLocations'],
    queryFn: searchService.getLocations,
  });

  useEffect(() => {
    setLocalFilters(initialFilters);
  }, [initialFilters]);

  const toggleCheckbox = (key, value) => {
    setLocalFilters((prev) => {
      const exists = prev[key].includes(value);
      return {
        ...prev,
        [key]: exists
          ? prev[key].filter((v) => v !== value)
          : [...prev[key], value],
      };
    });
  };

  const handleApply = () => {
    onApply(localFilters);
    setOpen(false);
  };

  const handleReset = () => {
    setLocalFilters(defaultFilters);
    onReset();
    setOpen(false);
  };

  return (
    <>
      {/* NÚT MỞ BỘ LỌC */}
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="flex items-center gap-2"
        size="sm"
      >
        <Filter className="h-4 w-4" />
        Bộ lọc
      </Button>

      {/* MODAL BỘ LỌC */}
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Bộ lọc nâng cao"
      >
        <div className="flex flex-col gap-6 p-4">
          {' '}
          {/* Thêm padding vào đây */}
          {/* DATE */}
          <Section title="Ngày tổ chức">
            <div className="flex gap-3">
              <input
                type="date"
                value={localFilters.dateFrom}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, dateFrom: e.target.value })
                }
                className="border-border-default bg-background-secondary focus:ring-primary w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:outline-none"
              />
              <input
                type="date"
                value={localFilters.dateTo}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, dateTo: e.target.value })
                }
                className="border-border-default bg-background-secondary focus:ring-primary w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:outline-none"
              />
            </div>
          </Section>
          {/* LOCATION */}
          <Section title="Địa điểm">
            <div className="flex flex-wrap gap-3">
              {availableLocations.map((loc) => (
                <CheckboxRow
                  key={loc.id}
                  label={loc.name}
                  checked={localFilters.locations.includes(loc.name)}
                  onToggle={() => toggleCheckbox('locations', loc.name)}
                />
              ))}
            </div>
          </Section>
          {/* CATEGORY */}
          <Section title="Thể loại">
            <div className="flex flex-wrap gap-3">
              {availableCategories.map((cat) => (
                <CheckboxRow
                  key={cat.id}
                  label={cat.name}
                  checked={localFilters.categories.includes(cat.name)}
                  onToggle={() => toggleCheckbox('categories', cat.name)}
                />
              ))}
            </div>
          </Section>
          {/* PRICE */}
          <Section title="Khoảng giá">
            <Slider
              range
              min={0}
              max={5000000}
              step={100000}
              value={localFilters.priceRange}
              onChange={(val) =>
                setLocalFilters({ ...localFilters, priceRange: val })
              }
              handleStyle={[
                {
                  borderColor: 'hsl(var(--color-primary))',
                  backgroundColor: 'hsl(var(--color-primary))',
                },
                {
                  borderColor: 'hsl(var(--color-primary))',
                  backgroundColor: 'hsl(var(--color-primary))',
                },
              ]}
            />
            <div className="text-text-secondary mt-2 flex justify-between text-xs font-medium">
              <span>{localFilters.priceRange[0].toLocaleString()}đ</span>
              <span>{localFilters.priceRange[1].toLocaleString()}đ</span>
            </div>
          </Section>
          {/* ACTION BUTTONS */}
          <div className="mt-4 flex gap-3">
            <Button onClick={handleReset} variant="outline" className="w-full">
              Đặt lại
            </Button>
            <Button onClick={handleApply} className="w-full">
              Áp dụng
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
