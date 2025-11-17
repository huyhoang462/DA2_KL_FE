import React from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '../../utils/lib';

export default function LoadingSpinner({ size = 'default', className }) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-10 w-10';
      case 'xl':
        return 'h-16 w-16';
      case 'default':
      default:
        return 'h-6 w-6';
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <LoaderCircle
      className={cn('text-primary animate-spin', sizeClasses, className)}
      aria-label="Đang tải..."
    />
  );
}

export function PageLoader({ text = 'Đang tải dữ liệu...' }) {
  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center gap-4 p-4">
      <LoadingSpinner size="lg" />
      {text && <p className="text-text-secondary text-sm">{text}</p>}
    </div>
  );
}
