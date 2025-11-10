import { useSelector, useDispatch } from 'react-redux';
import { updateEventField } from '../../../store/slices/eventSlice';
import { Banknote, Wallet } from 'lucide-react';
import { cn } from '../../../utils/lib';
import BankTransferForm from './BankTransferForm';
import MomoForm from './MomoForm';

const MethodSelector = ({ selectedMethod, onSelect }) => {
  const methods = [
    { id: 'bank_transfer', name: 'Chuyển khoản Ngân hàng', icon: Banknote },
    { id: 'momo', name: 'Ví điện tử MoMo', icon: Wallet },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {methods.map((method) => (
        <button
          key={method.id}
          type="button"
          onClick={() => onSelect(method.id)}
          className={cn(
            'flex flex-col items-center justify-center rounded-lg border-2 p-6 transition-all',
            selectedMethod === method.id
              ? 'border-primary bg-primary/10'
              : 'border-border-default hover:border-primary/50'
          )}
        >
          <method.icon
            className={cn(
              'mb-2 h-8 w-8',
              selectedMethod === method.id
                ? 'text-primary'
                : 'text-text-secondary'
            )}
          />
          <span className="text-text-primary font-semibold">{method.name}</span>
        </button>
      ))}
    </div>
  );
};

export default function PaymentInfoForm({ errors }) {
  const dispatch = useDispatch();
  const paymentInfo = useSelector((state) => state.event.event.paymentInfo);

  // Lấy phương thức đã chọn từ Redux, mặc định là bank_transfer
  const selectedMethod = paymentInfo?.method || 'bank_transfer';

  const handleMethodChange = (method) => {
    // Khi đổi phương thức, ta cập nhật method và reset các field khác
    // để tránh gửi nhầm dữ liệu cũ.
    const newPaymentInfo = { method };
    dispatch(updateEventField({ path: 'paymentInfo', value: newPaymentInfo }));
  };

  // Hàm này sẽ được truyền xuống các form con
  const handleFieldChange = (fieldName, fieldValue) => {
    const path = `paymentInfo.${fieldName}`;
    dispatch(updateEventField({ path, value: fieldValue }));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h2 className="text-text-primary text-lg leading-7 font-semibold">
          Thông tin nhận thanh toán
        </h2>
        <p className="text-text-secondary mt-1 text-sm">
          Chọn phương thức bạn muốn nhận tiền sau khi sự kiện kết thúc.
        </p>
      </div>

      <MethodSelector
        selectedMethod={selectedMethod}
        onSelect={handleMethodChange}
      />

      <div className="border-border-default border-t pt-8">
        {/* Hiển thị form tương ứng dựa trên phương thức đã chọn */}
        {selectedMethod === 'bank_transfer' && (
          <BankTransferForm
            data={paymentInfo}
            onChange={handleFieldChange}
            errors={errors?.paymentInfo || {}}
          />
        )}
        {selectedMethod === 'momo' && (
          <MomoForm
            data={paymentInfo}
            onChange={handleFieldChange}
            errors={errors?.paymentInfo || {}}
          />
        )}
      </div>
    </div>
  );
}
