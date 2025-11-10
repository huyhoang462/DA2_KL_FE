import React from 'react';
import Modal from './Modal'; 
import  Button  from './Button';
import { AlertTriangle } from 'lucide-react';


export default function ConfirmModal({
  isOpen,
  title = "Bạn có chắc chắn?",
  message,
  onConfirm,
  onCancel,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  confirmVariant = "destructive"
}) {
  return (
    <Modal isOpen={isOpen} title="" onClose={onCancel} xButton={true}>
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
        </div>
        <h3 className="mt-3 text-lg font-semibold leading-6 text-text-primary" id="modal-title">
          {title}
        </h3>
        <div className="mt-2">
          <p className="text-sm text-text-secondary">
            {message}
          </p>
        </div>
      </div>

      <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
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
        <Button
          type="button"
          className="mt-3 w-full sm:mt-0"
          variant="outline"
          onClick={onCancel}
        >
          {cancelText}
        </Button>
      </div>
    </Modal>
  );
}