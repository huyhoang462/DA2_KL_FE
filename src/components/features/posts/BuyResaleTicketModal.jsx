import React from 'react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import LoadingSpinner from '../../ui/LoadingSpinner';

const BuyResaleTicketModal = ({
  isOpen,
  onClose,
  selectedTickets = [],
  totalPrice = 0,
  isProcessing = false,
  statusMessage = '',
  onConfirmPayment,
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isProcessing ? undefined : onClose}
      title="Thanh toán vé mua lại"
      maxWidth="max-w-md"
      xButton={!isProcessing}
    >
      <div className="space-y-6">
        <div className="bg-background-secondary border-border-default rounded-xl border p-4">
          <h4 className="text-text-primary mb-4 text-sm font-semibold">
            Danh sách vé ({selectedTickets.length})
          </h4>
          <div className="flex max-h-48 flex-col gap-3 overflow-y-auto pr-2">
            {selectedTickets.map((ticket, index) => (
              <div
                key={index}
                className="border-border-default flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-text-primary text-sm font-medium">
                    {ticket.ticketTypeName} - {ticket.showName}
                  </p>
                  <p className="text-text-secondary text-xs">
                    Token ID: {ticket.tokenId != null ? ticket.tokenId.toString() : 'N/A'}
                  </p>
                </div>
                <p className="text-sm font-bold text-orange-600">
                  {ticket.price} USDT
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-text-secondary text-base font-medium">
            Tổng thanh toán:
          </span>
          <span className="text-xl font-bold text-orange-600">
            {totalPrice} USDT
          </span>
        </div>

        {isProcessing && (
          <div className="bg-primary/10 flex flex-col items-center justify-center rounded-xl p-4 text-center">
            <LoadingSpinner size="md" className="text-primary mb-3" />
            <p className="text-primary text-sm font-medium animate-pulse">
              {statusMessage || 'Đang xử lý giao dịch...'}
            </p>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={isProcessing}
          >
            Hủy
          </Button>
          <Button
            className="flex-1"
            onClick={onConfirmPayment}
            loading={isProcessing}
            disabled={selectedTickets.length === 0}
          >
            Thanh toán (USDT)
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BuyResaleTicketModal;
