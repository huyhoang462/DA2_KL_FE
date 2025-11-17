import { Banknote, Wallet } from 'lucide-react';
import { cn } from '../../../utils/lib';

const PaymentMethodSelector = ({ selectedMethod, onSelect }) => {
  const methods = [
    { id: 'bank_account', name: 'Chuyển khoản Ngân hàng', icon: Banknote },
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
            'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 p-6 transition-all',
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
export default PaymentMethodSelector;
