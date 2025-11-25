import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { CheckCircle, XCircle } from 'lucide-react';

export default function NotificationModal({
  isOpen,
  type = 'success',
  title,
  message,
  onClose,
  xButton = false,
  buttonText = 'Đóng',
}) {
  const isSuccess = type === 'success';

  return (
    <Modal isOpen={isOpen} title="" onClose={onClose} xButton={xButton}>
      <div className="text-center">
        <div
          className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
            isSuccess ? 'bg-green-100' : 'bg-red-100'
          }`}
        >
          {isSuccess ? (
            <CheckCircle className="h-6 w-6 text-green-600" />
          ) : (
            <XCircle className="h-6 w-6 text-red-600" />
          )}
        </div>

        <h3 className="text-text-primary mt-3 text-lg leading-6 font-semibold">
          {title}
        </h3>

        <div className="mt-2">
          <p className="text-text-secondary text-sm">{message}</p>
        </div>
      </div>

      <div className="mt-5">
        <Button
          type="button"
          className="w-full"
          variant={isSuccess ? 'default' : 'destructive'}
          onClick={onClose}
        >
          {buttonText}
        </Button>
      </div>
    </Modal>
  );
}
