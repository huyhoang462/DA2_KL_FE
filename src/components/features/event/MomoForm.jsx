import React from 'react';
import Input from '../../ui/Input';

export default function MomoForm({ data, onChange, errors }) {
  const handleChange = (e) => {
    onChange(e.target.name, e.target.value);
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-text-primary">Chi tiết ví MoMo</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Input
          label="Số điện thoại MoMo"
          name="momoPhoneNumber"
          type="tel"
          value={data?.momoPhoneNumber || ''}
          onChange={handleChange}
          error={errors?.momoPhoneNumber}
        />
        <Input
          label="Tên chủ ví"
          name="momoAccountName"
          value={data?.momoAccountName || ''}
          onChange={handleChange}
          error={errors?.momoAccountName}
          placeholder="Tên đầy đủ, không dấu"
        />
      </div>
    </div>
  );
}