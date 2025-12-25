import React, { useState } from 'react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import TextArea from '../../ui/TextArea';
import { AlertTriangle } from 'lucide-react';

const RefundTransactionModal = ({
  isOpen,
  onClose,
  transaction,
  onConfirm,
  isLoading,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do hoàn tiền');
      return;
    }
    onConfirm(reason);
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  if (!transaction) return null;

  return (
    <Modal isOpen={isOpen} title="" onClose={handleClose}>
      <div className="text-center">
        <div className="bg-warning/10 mx-auto flex h-14 w-14 items-center justify-center rounded-full">
          <AlertTriangle className="text-warning h-7 w-7" aria-hidden="true" />
        </div>
        <h3 className="text-text-primary mt-4 text-lg font-semibold">
          Xác nhận hoàn tiền
        </h3>
        <div className="mt-3">
          <p className="text-text-secondary text-sm leading-relaxed">
            Bạn có chắc chắn muốn hoàn tiền cho giao dịch{' '}
            <strong className="text-text-primary">
              {transaction.transactionCode}
            </strong>
            ?
          </p>
          <div className="bg-background-primary border-border-default mt-4 rounded-lg border p-4 text-left">
            <div className="flex justify-between">
              <span className="text-text-secondary text-sm">Số tiền:</span>
              <span className="text-text-primary font-semibold">
                {transaction.amount?.toLocaleString('vi-VN')} ₫
              </span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="text-text-secondary text-sm">Người mua:</span>
              <span className="text-text-primary text-sm">
                {transaction.buyer?.fullName}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 text-left">
          <label className="text-text-primary mb-2 block text-sm font-medium">
            Lý do hoàn tiền <span className="text-destructive">*</span>
          </label>
          <TextArea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError('');
            }}
            placeholder="Nhập lý do hoàn tiền cho giao dịch này..."
            rows={4}
            className={error ? 'border-destructive' : ''}
            disabled={isLoading}
          />
          {error && <p className="text-destructive mt-1 text-sm">{error}</p>}
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
        <Button
          type="button"
          className="w-full sm:w-auto sm:min-w-[120px]"
          variant="outline"
          onClick={handleClose}
          disabled={isLoading}
        >
          Hủy
        </Button>
        <Button
          type="button"
          className="w-full sm:w-auto sm:min-w-[120px]"
          variant="warning"
          onClick={handleConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Đang xử lý...' : 'Xác nhận hoàn tiền'}
        </Button>
      </div>
    </Modal>
  );
};

export default RefundTransactionModal;
