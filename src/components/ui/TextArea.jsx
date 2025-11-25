import React from 'react';
import clsx from 'clsx';

export default function Input({
  id,
  label,
  rows = 2,
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  error,
  className = '',
  inputClassName = '',
  disabled = false,
  ...props
}) {
  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-text-secondary mb-2 block text-sm font-medium"
        >
          {label}
        </label>
      )}
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        spellCheck={false}
        className={clsx(
          'bg-background-secondary text-text-primary placeholder-text-placeholder focus:border-primary block w-full rounded-lg border p-2.5 transition outline-none focus:outline-none',
          error ? 'border-destructive' : 'border-border-default',
          inputClassName
        )}
        {...props}
      />
      {error && <div className="text-destructive mt-1 text-xs">{error}</div>}
    </div>
  );
}
