import React from 'react';
import Input from '../../ui/Input';
// import BankSelect from './BankSelect'; // Component chọn ngân hàng sẽ fetch API

export default function BankTransferForm({ data, onChange, errors }) {
  const handleChange = (e) => {
    onChange(e.target.name, e.target.value);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-text-primary font-semibold">
        Chi tiết tài khoản ngân hàng
      </h3>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* 
            Component này sẽ fetch API từ VietQR hoặc nguồn tương tự 
            để lấy danh sách các ngân hàng.
            Tạm thời dùng Input.
          */}
        <div className="sm:col-span-2">
          <Input
            label="Tên ngân hàng"
            name="bankName"
            value={data?.bankName || ''}
            onChange={handleChange}
            error={errors?.bankName}
          />
        </div>
        <Input
          label="Chi nhánh (Tùy chọn)"
          name="bankBranch"
          value={data?.bankBranch || ''}
          onChange={handleChange}
          error={errors?.bankBranch}
        />
        <Input
          label="Số tài khoản"
          name="accountNumber"
          value={data?.accountNumber || ''}
          onChange={handleChange}
          error={errors?.accountNumber}
        />
        <div className="sm:col-span-2">
          <Input
            label="Tên chủ tài khoản"
            name="accountName"
            value={data?.accountName || ''}
            onChange={handleChange}
            error={errors?.accountName}
            placeholder="Tên đầy đủ, không dấu"
          />
        </div>
      </div>
    </div>
  );
}
