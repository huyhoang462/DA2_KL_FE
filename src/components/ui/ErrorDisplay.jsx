import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from './Button';
import { cn } from '../../utils/lib';

export default function ErrorDisplay({
  title = 'Đã có lỗi xảy ra',
  message,
  onRetry,
  className,
}) {
  return (
    <div
      role="alert"
      className={cn(
        'border-destructive/50 bg-destructive/10 text-destructive flex flex-col items-center justify-center gap-4 rounded-lg border p-6 text-center',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-8 w-8" />
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>

      {message && (
        <p className="text-destructive/80 max-w-md text-sm">{message}</p>
      )}

      {onRetry && (
        <Button variant="destructive" onClick={onRetry} className="mt-4">
          Thử lại
        </Button>
      )}
    </div>
  );
}

export function PageError({ message, onRetry }) {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
      <ErrorDisplay message={message} onRetry={onRetry} />
    </div>
  );
}
