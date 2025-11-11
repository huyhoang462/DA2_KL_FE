import React from 'react';
import Input from '../../ui/Input';

export default function MomoForm({ data, onChange, errors }) {
  const handleChange = (e) => {
    onChange(e.target.name, e.target.value);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-text-primary font-semibold">Chi tiết ví MoMo</h3>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Input
          id="momoPhoneNumber"
          label="Số điện thoại MoMo"
          name="phoneNumber"
          type="tel"
          value={data?.phoneNumber || ''}
          onChange={handleChange}
          error={errors?.phoneNumber}
        />
        <Input
          id="momoAcountName"
          label="Tên chủ ví"
          name="accountName"
          value={data?.accountName || ''}
          onChange={handleChange}
          error={errors?.accountName}
          placeholder="Tên đầy đủ, không dấu"
        />
      </div>
    </div>
  );
}
