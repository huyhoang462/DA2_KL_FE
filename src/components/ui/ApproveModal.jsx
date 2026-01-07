import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { CheckCircle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

export default function ApproveModal({
  isOpen,
  title = 'Xác nhận phê duyệt',
  message = 'Bạn có chắc chắn muốn phê duyệt sự kiện này?',
  description = 'Sự kiện sẽ được công khai và người dùng có thể mua vé',
  onConfirm,
  onCancel,
  confirmText = 'Phê duyệt',
  cancelText = 'Hủy',
  xButton = true,
  isLoading = false,
}) {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Modal isOpen={isOpen} title="" onClose={handleCancel} xButton={xButton}>
      <div className="text-center">
        <div className="bg-success/30 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
          <CheckCircle className="text-success h-6 w-6" aria-hidden="true" />
        </div>
        <h3
          className="text-text-primary mt-3 text-lg leading-6 font-semibold"
          id="modal-title"
        >
          {title}
        </h3>
        <div className="mt-2">
          <p className="text-text-primary text-sm">{message}</p>
          {description && (
            <p className="text-text-secondary mt-2 text-sm">{description}</p>
          )}
        </div>
      </div>

      <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
        <Button
          type="button"
          className="mt-3 w-full sm:mt-0"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
        >
          {cancelText}
        </Button>
        <Button
          type="button"
          className="flex w-full items-center justify-center gap-2"
          variant="success"
          onClick={handleConfirm}
          disabled={isLoading}
        >
          {isLoading && <LoadingSpinner size="sm" />}
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
