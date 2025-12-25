import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import TextArea from './TextArea';
import { Ban } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

export default function BanUserModal({
  isOpen,
  onConfirm,
  onCancel,
  userName,
  isLoading = false,
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do ban user');
      return;
    }
    onConfirm(reason);
    // Reset state after confirm
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
          <Ban className="text-destructive h-6 w-6" aria-hidden="true" />
        </div>
        <h3
          className="text-text-primary mt-3 text-lg leading-6 font-semibold"
          id="modal-title"
        >
          Ban người dùng
        </h3>
        <div className="mt-2">
          <p className="text-text-secondary text-sm">
            Bạn có chắc chắn muốn ban <strong>{userName}</strong>?
          </p>
          <p className="text-text-secondary mt-1 text-xs">
            Người dùng sẽ không thể đăng nhập cho đến khi được unban.
          </p>
        </div>
      </div>

      <div className="mt-4 text-left">
        <label
          htmlFor="ban-reason"
          className="text-text-primary mb-2 block text-sm font-medium"
        >
          Lý do ban <span className="text-destructive">*</span>
        </label>
        <TextArea
          id="ban-reason"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setError('');
          }}
          placeholder="Nhập lý do ban người dùng (ví dụ: Spam, vi phạm chính sách, hành vi gian lận...)"
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
          Hủy
        </Button>
        <Button
          type="button"
          className="flex w-full items-center justify-center gap-2"
          variant="destructive"
          onClick={handleConfirm}
          disabled={isLoading}
        >
          {isLoading && <LoadingSpinner size="sm" />}
          Xác nhận Ban
        </Button>
      </div>
    </Modal>
  );
}
