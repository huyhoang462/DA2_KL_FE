import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title = 'Bạn có chắc chắn?',
  icon,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  confirmVariant = 'destructive',
}) {
  return (
    <Modal isOpen={isOpen} title="" onClose={onCancel} xButton={true}>
      <div className="text-center">
        {icon || (
          <div className="bg-destructive/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
            <AlertTriangle
              className="text-destructive h-6 w-6"
              aria-hidden="true"
            />
          </div>
        )}
        <h3
          className="text-text-primary mt-3 text-lg leading-6 font-semibold"
          id="modal-title"
        >
          {title}
        </h3>
        <div className="mt-2">
          <p className="text-text-secondary text-sm">{message}</p>
        </div>
      </div>

      <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
        <Button
          type="button"
          className="mt-3 w-full sm:mt-0"
          variant="outline"
          onClick={onCancel}
        >
          {cancelText}
        </Button>
        <Button
          type="button"
          className="w-full"
          variant={confirmVariant}
          onClick={() => {
            onConfirm();
            onCancel();
          }}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
