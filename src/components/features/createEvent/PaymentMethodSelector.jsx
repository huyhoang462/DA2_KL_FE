import { Banknote, Wallet } from 'lucide-react';
import { cn } from '../../../utils/lib';

const PaymentMethodSelector = ({ selectedMethod, onSelect }) => {
  const methods = [
    { id: 'bank_account', name: 'Ngân hàng', icon: Banknote },
    { id: 'momo', name: 'MoMo', icon: Wallet },
  ];

  return (
    <div className="flex gap-4">
      {methods.map((method) => (
        <button
          key={method.id}
          type="button"
          onClick={() => onSelect(method.id)}
          className={cn(
            'flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 p-2 transition-all',
            selectedMethod === method.id
              ? 'border-primary bg-primary/10'
              : 'border-border-default hover:border-primary/50'
          )}
        >
          <method.icon
            className={cn(
              '',
              selectedMethod === method.id
                ? 'text-primary'
                : 'text-text-secondary'
            )}
          />
          <span className="text-text-primary text-sm font-semibold">
            {method.name}
          </span>
        </button>
      ))}
    </div>
  );
};
export default PaymentMethodSelector;
