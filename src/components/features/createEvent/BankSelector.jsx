import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllBanks } from '../../../services/thirdService';

export default function BankSelector({ value, onChange, error, disabled }) {
  const { data: banks, isLoading } = useQuery({
    queryKey: ['banks'],
    queryFn: getAllBanks,
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div>
      <label
        htmlFor="bankSelector"
        className="text-text-secondary mb-2 block text-sm font-medium"
      >
        Ngân hàng
      </label>
      <select
        id="bankSelector"
        value={value}
        name="bankName"
        onChange={onChange}
        disabled={disabled || isLoading}
        className={`bg-background-secondary text-text-primary placeholder-text-placeholder focus:border-primary block w-full rounded-lg border p-2.5 transition outline-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-80 ${error ? 'border-destructive' : 'border-border-default'}`}
      >
        <option value="">
          {isLoading ? 'Đang tải ngân hàng...' : 'Chọn ngân hàng'}
        </option>

        {banks?.map((bank) => (
          <option key={bank.id} value={bank.name}>
            {bank.shortName || bank.name}
          </option>
        ))}
      </select>

      {error && <div className="text-destructive mt-1 text-xs">{error}</div>}
    </div>
  );
}
