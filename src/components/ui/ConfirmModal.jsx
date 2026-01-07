import React from 'react';
import Modal from './Modal';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title = 'Bạn có chắc chắn?',
  icon,
  iconBgColor = 'bg-destructive/10',
  iconColor = 'text-destructive',
  message,
  onConfirm,
  onCancel,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  confirmVariant = 'destructive',
  xButton = true,
  isLoading = false,
}) {
  const defaultIcon = (
    <div
      className={`${iconBgColor} mx-auto flex h-12 w-12 items-center justify-center rounded-full`}
    >
      <AlertTriangle className={`${iconColor} h-6 w-6`} aria-hidden="true" />
    </div>
  );

  return (
    <Modal isOpen={isOpen} title="" onClose={onCancel} xButton={xButton}>
      <div className="text-center">
        {icon !== undefined ? icon : defaultIcon}
        <h3
          className="text-text-primary mt-4 text-lg leading-6 font-semibold"
          id="modal-title"
        >
          {title}
        </h3>
        <div className="mt-3">
          <p className="text-text-secondary text-sm leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
        <Button
          type="button"
          className="w-full sm:w-auto sm:min-w-[120px]"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          {cancelText}
        </Button>
        <Button
          type="button"
          className="flex w-full items-center justify-center gap-2 sm:w-auto sm:min-w-[120px]"
          variant={confirmVariant}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading && <LoadingSpinner size="sm" />}
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
