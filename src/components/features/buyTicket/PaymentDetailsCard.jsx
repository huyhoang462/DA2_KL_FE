// src/pages/payment/partials/PaymentDetailsCard.jsx
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Banknote, Copy, Smartphone, Check } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { orderService } from '../../../services/orderService';
import { cn } from '../../../utils/lib';
// import { toast } from 'react-hot-toast';

export default function PaymentDetailsCard({
  methods,
  orderId,
  isCreatingOrder,
}) {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const queryClient = useQueryClient();
  const [selectedMethod, setSelectedMethod] = useState(
    methods.find((m) => m.isDefault) || methods[0]
  );
  const [copied, setCopied] = useState(false);

  const completeOrderMutation = useMutation({
    mutationFn: () => orderService.confirmPayment(orderId),
    onSuccess: () => {
      // toast.success("Đã xác nhận thanh toán! Vui lòng chờ Admin duyệt.");
      alert('Đã xác nhận thanh toán! Vui lòng chờ Admin duyệt.');
      queryClient.invalidateQueries({ queryKey: ['myTickets'] });
      navigate('/user/tickets'); // Chuyển đến trang vé của tôi
    },
    onError: (error) => {
      // toast.error(error.message || "Không thể xác nhận thanh toán.");
      alert(error.message || 'Không thể xác nhận thanh toán.');
    },
  });

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const transferContent = orderId ? `${orderId}` : '...';

  const renderMethodDetails = () => {
    if (selectedMethod.methodType === 'bank_account') {
      return (
        <div className="space-y-2 text-sm">
          <p>
            <span className="text-text-secondary font-semibold">
              Ngân hàng:
            </span>{' '}
            {selectedMethod.bankDetails.bankName}
          </p>
          <p>
            <span className="text-text-secondary font-semibold">
              Số tài khoản:
            </span>{' '}
            {selectedMethod.bankDetails.accountNumber}
          </p>
          <p>
            <span className="text-text-secondary font-semibold">
              Chủ tài khoản:
            </span>{' '}
            {selectedMethod.bankDetails.accountName}
          </p>
        </div>
      );
    }
    if (selectedMethod.methodType === 'momo') {
      return (
        <div className="space-y-2 text-sm">
          <p>
            <span className="text-text-secondary font-semibold">
              Số điện thoại:
            </span>{' '}
            {selectedMethod.momoDetails.phoneNumber}
          </p>
          <p>
            <span className="text-text-secondary font-semibold">
              Chủ tài khoản:
            </span>{' '}
            {selectedMethod.momoDetails.accountName}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="border-border-default bg-background-secondary rounded-lg border p-6">
      <h2 className="text-text-primary mb-4 text-lg font-bold">
        Thông tin thanh toán
      </h2>

      {/* Chọn phương thức */}
      <div className="mb-6 space-y-4">
        <p className="text-text-secondary text-sm font-medium">
          Chọn phương thức thanh toán
        </p>

        <div className="flex gap-4">
          {methods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method)}
              className={cn(
                'flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 p-2 transition-all',
                selectedMethod.id === method.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border-default hover:border-primary/50'
              )}
            >
              {method.methodType === 'bank_account' ? (
                <Banknote
                  className={cn(
                    '',
                    selectedMethod.id === method.id
                      ? 'text-primary'
                      : 'text-text-secondary'
                  )}
                />
              ) : (
                <Smartphone
                  className={cn(
                    '',
                    selectedMethod.id === method.id
                      ? 'text-primary'
                      : 'text-text-secondary'
                  )}
                />
              )}
              {method.methodType === 'bank_account' ? 'Ngân hàng' : 'MoMo'}
            </button>
          ))}
        </div>
      </div>

      {/* Hiển thị chi tiết */}
      <div className="bg-foreground rounded-lg p-4">
        {renderMethodDetails()}
      </div>

      <div className="bg-foreground mt-4 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-secondary text-sm">
              Nội dung chuyển khoản (Bắt buộc)
            </p>
            <p className="text-primary text-lg font-bold tracking-wider">
              {transferContent}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleCopy(transferContent)}
          >
            {copied ? (
              <Check className="text-success h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <Button
          className="w-full"
          size="lg"
          onClick={completeOrderMutation.mutate}
          disabled={
            !orderId || isCreatingOrder || completeOrderMutation.isPending
          }
        >
          {completeOrderMutation.isPending
            ? 'Đang xử lý...'
            : 'Tôi đã thanh toán'}
        </Button>
        <p className="text-text-secondary mt-2 text-center text-xs">
          Sau khi chuyển khoản, hãy nhấn nút này để chúng tôi xác nhận.
        </p>
      </div>
    </div>
  );
}
