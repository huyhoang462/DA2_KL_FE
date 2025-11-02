import React from 'react';
import Input from '../../ui/Input';
import clsx from 'clsx';

export default function OrganizerInput({ value, onChange }) {
  const handleChange = (e) => {
    const { name, value: fieldValue } = e.target;
    onChange(name, fieldValue);
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-6">
      <div className="sm:col-span-6">
        <Input
          id="organizerName"
          label="Tên nhà tổ chức / Công ty"
          name="name"
          placeholder="Ví dụ: Shine Inc."
          value={value?.name || ''}
          onChange={handleChange}
          required
        />
      </div>

      <div className="sm:col-span-3">
        <Input
          id="organizerEmail"
          label="Email liên hệ"
          name="email"
          type="email"
          placeholder="contact@example.com"
          value={value?.email || ''}
          onChange={handleChange}
        />
      </div>

      <div className="sm:col-span-3">
        <Input
          id="organizerPhone"
          label="Số điện thoại"
          name="phone"
          type="tel"
          placeholder="0123 456 789"
          value={value?.phone || ''}
          onChange={handleChange}
        />
      </div>

      <div className="sm:col-span-6">
        <label
          htmlFor="organizerDescription"
          className="text-text-secondary mb-2 block text-sm font-medium"
        >
          Giới thiệu về ban tổ chức
        </label>
        <textarea
          id="organizerDescription"
          name="description"
          rows={3}
          spellCheck={false}
          className={clsx(
            'bg-background-secondary text-text-primary border-border-default placeholder-text-placeholder focus:border-primary block w-full rounded-lg border p-2.5 transition outline-none focus:outline-none'
          )}
          placeholder="Một vài dòng giới thiệu về ban tổ chức..."
          value={value?.description || ''}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
