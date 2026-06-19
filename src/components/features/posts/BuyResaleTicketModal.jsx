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
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="flex flex-col items-center rounded-xl bg-white p-8 shadow-2xl">
              <LoadingSpinner className="text-primary mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                Đang xử lý mua lại vé...
              </h3>
              <p className="animate-pulse font-medium text-blue-600">
                {statusMessage || 'Vui lòng xác nhận trên ví của bạn'}
              </p>
            </div>
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
