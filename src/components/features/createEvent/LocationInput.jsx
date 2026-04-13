import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { locationService } from '../../../services/thirdService';
import useClickOutside from '../../../hooks/useClickOutside';
import Input from '../../ui/Input';

const normalizeText = (text = '') =>
  text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const SearchableLocationSelect = ({
  id,
  label,
  placeholder,
  searchPlaceholder,
  options,
  value,
  onChange,
  disabled,
  isLoading,
  error,
  noResultText,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useClickOutside(() => {
    setIsOpen(false);
  });

  const selectedOption = useMemo(
    () => options?.find((option) => String(option.code) === String(value)),
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    if (!query) return options || [];

    const normalizedQuery = normalizeText(query);
    return (options || []).filter((option) =>
      normalizeText(option.name).includes(normalizedQuery)
    );
  }, [options, query]);

  useEffect(() => {
    if (!isOpen) {
      setQuery(selectedOption?.name || '');
    }
  }, [selectedOption, isOpen]);

  const handleInputChange = (e) => {
    const nextQuery = e.target.value;
    setQuery(nextQuery);
    setIsOpen(true);

    if (selectedOption && nextQuery !== selectedOption.name) {
      onChange('');
    }
  };

  const handleSelectOption = (option) => {
    onChange(option.code);
    setQuery(option.name);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef}>
      <label
        htmlFor={id}
        className="text-text-secondary mb-2 block text-sm font-medium"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={
            isLoading ? 'Đang tải...' : searchPlaceholder || placeholder
          }
          disabled={disabled || isLoading}
          className={`bg-background-secondary text-text-primary placeholder-text-placeholder focus:border-primary block w-full rounded-lg border p-2.5 pr-10 transition outline-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-80 ${error ? 'border-destructive' : 'border-border-default'}`}
        />

        {!disabled && !isLoading && query && (
          <button
            type="button"
            onClick={handleClear}
            className="text-text-secondary hover:text-text-primary absolute top-1/2 right-3 -translate-y-1/2 text-lg"
            aria-label="Xóa lựa chọn"
          >
            ×
          </button>
        )}

        {isOpen && !disabled && (
          <div className="bg-background-primary border-border-default absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border shadow-md">
            {isLoading ? (
              <div className="text-text-secondary px-3 py-2 text-sm">
                Đang tải...
              </div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelectOption(option)}
                  className="text-text-primary hover:bg-background-secondary w-full px-3 py-2 text-left text-sm"
                >
                  {option.name}
                </button>
              ))
            ) : (
              <div className="text-text-secondary px-3 py-2 text-sm">
                {noResultText || 'Không tìm thấy kết quả'}
              </div>
            )}
          </div>
        )}
      </div>

      {error && <div className="text-destructive mt-1 text-xs">{error}</div>}
    </div>
  );
};

export default function LocationInput({ value, onChange, error, disabled }) {
  const [selectedProvinceCode, setSelectedProvinceCode] = useState(
    value?.province?.code || ''
  );

  const { data: provinces, isLoading: isLoadingProvinces } = useQuery({
    queryKey: ['provinces'],
    queryFn: locationService.getAllProvinces,
    staleTime: Infinity,
  });

  const { data: allWards, isLoading: isLoadingWards } = useQuery({
    queryKey: ['wards'],
    queryFn: locationService.getAllWards,
    staleTime: Infinity,
  });

  const handleProvinceChange = (code) => {
    const selectedProvince = provinces?.find(
      (province) => String(province.code) === String(code)
    );

    setSelectedProvinceCode(code);
    onChange(
      'province',
      selectedProvince
        ? { code: selectedProvince.code, name: selectedProvince.name }
        : null
    );
    onChange('ward', null);
  };

  const filteredWards = useMemo(() => {
    if (!selectedProvinceCode || !allWards) {
      return [];
    }
    const provinceCodeNumber = Number(selectedProvinceCode);

    return allWards.filter((ward) => ward.province_code === provinceCodeNumber);
  }, [selectedProvinceCode, allWards]);

  const handleWardChange = (code) => {
    const selectedWard = filteredWards.find(
      (ward) => String(ward.code) === String(code)
    );

    onChange(
      'ward',
      selectedWard ? { code: selectedWard.code, name: selectedWard.name } : null
    );
  };

  useEffect(() => {
    setSelectedProvinceCode(value?.province?.code || '');
  }, [value?.province?.code]);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div className="sm:col-span-1">
        <SearchableLocationSelect
          id="eventProvince"
          label="Tỉnh / Thành phố"
          placeholder="-- Chọn Tỉnh / Thành phố --"
          searchPlaceholder="Gõ để tìm tỉnh/thành..."
          options={provinces}
          value={value?.province?.code || ''}
          onChange={handleProvinceChange}
          isLoading={isLoadingProvinces}
          error={error?.province}
          disabled={disabled}
        />
      </div>

      <div className="sm:col-span-1">
        <SearchableLocationSelect
          id="eventWard"
          label="Xã / Phường"
          placeholder="-- Chọn Xã / Phường --"
          searchPlaceholder="Gõ để tìm xã/phường..."
          options={filteredWards}
          value={value?.ward?.code || ''}
          onChange={handleWardChange}
          isLoading={isLoadingWards}
          disabled={disabled || !selectedProvinceCode || isLoadingProvinces}
          error={error?.ward}
          noResultText={
            selectedProvinceCode
              ? 'Không có xã/phường phù hợp'
              : 'Vui lòng chọn tỉnh/thành trước'
          }
        />
      </div>

      <div className="sm:col-span-2">
        <Input
          id="eventStreet"
          label="Tên đường, Số nhà & Chi tiết địa chỉ"
          placeholder="Ví dụ: 123 Nguyễn Huệ, Tòa nhà Bitexco"
          value={value?.street || ''}
          onChange={(e) => onChange('street', e.target.value)}
          disabled={disabled}
          error={error?.street}
        />
      </div>
    </div>
  );
}
