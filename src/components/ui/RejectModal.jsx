import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';
import TextArea from './TextArea';
import LoadingSpinner from './LoadingSpinner';

export default function RejectModal({
  isOpen,
  title = 'Từ chối sự kiện',
  message = 'Vui lòng nhập lý do từ chối sự kiện này',
  onConfirm,
  onCancel,
  confirmText = 'Xác nhận từ chối',
  cancelText = 'Hủy',
  isLoading = false,
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do từ chối');
      return;
    }
    onConfirm(reason);
    // Reset state
    setReason('');
    setError('');
  };

  const handleCancel = () => {
    setReason('');
    setError('');
    onCancel();
  };

  return (
    <Modal isOpen={isOpen} title="" onClose={handleCancel} xButton={true}>
      <div className="text-center">
        <div className="bg-destructive/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
          <AlertTriangle
            className="text-destructive h-6 w-6"
            aria-hidden="true"
          />
        </div>
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

      <div className="mt-4 text-left">
        <label
          htmlFor="reject-reason"
          className="text-text-primary mb-2 block text-sm font-medium"
        >
          Lý do từ chối <span className="text-destructive">*</span>
        </label>
        <TextArea
          id="reject-reason"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setError('');
          }}
          placeholder="Nhập lý do từ chối sự kiện..."
          rows={4}
          className={error ? 'border-destructive' : ''}
          disabled={isLoading}
        />
        {error && <p className="text-destructive mt-1 text-sm">{error}</p>}
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
          variant="destructive"
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
