import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

const variants = {
  default: 'bg-primary text-primary-foreground hover:bg-primary-hover',
  success: 'bg-success text-success-foreground hover:bg-success-hover',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-destructive-hover',
  outline: 'border border-border bg-transparent hover:bg-accent-hover',
  secondary: 'bg-foreground text-text-primary hover:bg-accent-hover',
  ghost: 'bg-transparent hover:bg-accent-hover',
  disabled: 'bg-gray-200 text-gray-500 cursor-not-allowed hover:bg-gray-200',
  link: 'bg-transparent text-text-link underline-offset-4 hover:underline p-0',
};

const sizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 px-3',
  lg: 'h-11 px-8',
};

export default function Button({
  type = 'button',
  variant = 'default',
  size = 'default',
  className = '',
  loading = false,
  disabled = false,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={clsx(
        'inline-flex cursor-pointer items-center justify-center rounded-lg text-sm font-semibold whitespace-nowrap transition-colors',
        'ring-0 outline-none disabled:pointer-events-none',
        variants[loading || disabled ? 'disabled' : variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
