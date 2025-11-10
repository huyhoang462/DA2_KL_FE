import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { locationService } from '../../../services/thirdService';
import Input from '../../ui/Input';

const SelectLocation = ({
  id,
  label,
  placeholder,
  options,
  value,
  onChange,
  disabled,
  isLoading,
  error,
}) => (
  <div>
    <label
      htmlFor={id}
      className="text-text-secondary mb-2 block text-sm font-medium"
    >
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled || isLoading}
      className={`bg-background-secondary text-text-primary placeholder-text-placeholder focus:border-primary border-border-default block w-full rounded-lg border p-2.5 transition outline-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-destructive' : 'border-border-default'}`}
    >
      <option value="">{isLoading ? 'Đang tải...' : placeholder}</option>
      {options?.map((option) => (
        <option key={option.code} value={option.code}>
          {option.name}
        </option>
      ))}
    </select>
    {error && <div className="text-destructive mt-1 text-xs">{error}</div>}
  </div>
);

export default function LocationInput({ value, onChange, error }) {
  const [selectedProvinceCode, setSelectedProvinceCode] = useState(
    value?.province || ''
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

  const handleProvinceChange = (e) => {
    const code = e.target.value;
    const selectedProvince = provinces?.find((p) => p.code == code);
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

  const handleWardChange = (e) => {
    const code = e.target.value;

    const selectedWard = filteredWards.find((w) => w.code == code);
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
        <SelectLocation
          id="eventProvince"
          label="Tỉnh / Thành phố"
          placeholder="-- Chọn Tỉnh / Thành phố --"
          options={provinces}
          value={value?.province?.code || ''}
          onChange={handleProvinceChange}
          isLoading={isLoadingProvinces}
          error={error?.province}
        />
      </div>

      <div className="sm:col-span-1">
        <SelectLocation
          id="eventWard"
          label="Xã / Phường"
          placeholder="-- Chọn Xã / Phường --"
          options={filteredWards}
          value={value?.ward?.code || ''}
          onChange={handleWardChange}
          isLoading={isLoadingWards}
          disabled={!selectedProvinceCode || isLoadingProvinces}
          error={error?.ward}
        />
      </div>

      <div className="sm:col-span-2">
        <Input
          id="eventStreet"
          label="Tên đường, Số nhà & Chi tiết địa chỉ"
          placeholder="Ví dụ: 123 Nguyễn Huệ, Tòa nhà Bitexco"
          value={value?.street || ''}
          onChange={(e) => onChange('street', e.target.value)}
          disabled={!value?.ward}
          error={error?.street}
        />
      </div>
    </div>
  );
}
