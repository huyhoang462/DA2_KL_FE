import React from 'react';
import { Check, CreditCard, Smartphone, Trash2 } from 'lucide-react';
import Button from '../../ui/Button';
import { cn } from '../../../utils/lib';

const SavedPaymentMethods = ({
  payoutMethods,
  selectedMethodId,
  onSelect,
  onDelete,
  disabled = false,
}) => {
  const formatPayoutMethod = (method) => {
    if (method.methodType === 'bank_account') {
      return {
        icon: CreditCard,
        title: method.bankDetails.bankName,
        subtitle: `**** **** **** ${method.bankDetails.accountNumber.slice(-4)}`,
        accountName: method.bankDetails.accountName,
      };
    } else if (method.methodType === 'momo') {
      return {
        icon: Smartphone,
        title: 'Ví MoMo',
        subtitle: `****${method.momoDetails.phoneNumber.slice(-3)}`,
        accountName: method.momoDetails.accountName,
      };
    }
    return null;
  };

  return (
    <div
      className={cn('space-y-3', disabled && 'opacity- pointer-events-none')}
    >
      {payoutMethods.map((method) => {
        const formatted = formatPayoutMethod(method);
        const IconComponent = formatted.icon;
        const isSelected = selectedMethodId === method.id;

        return (
          <div
            key={method.id}
            className={cn(
              'border-border-default rounded-lg border p-4 transition-all',

              disabled
                ? 'cursor-not-allowed'
                : 'hover:border-primary/50 cursor-pointer',
              isSelected
                ? 'border-primary bg-primary/5 ring-primary/20 ring-2'
                : ''
            )}
            onClick={disabled ? undefined : () => onSelect(method)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'rounded-lg p-2',
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background-secondary text-text-secondary',
                    disabled && 'opacity-70'
                  )}
                >
                  <IconComponent className="h-5 w-5" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h5
                      className={cn(
                        'font-medium',
                        disabled ? 'text-text-secondary' : 'text-text-primary'
                      )}
                    >
                      {formatted.title}
                    </h5>
                    {method.isDefault && (
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          disabled
                            ? 'bg-success/5 text-success/60'
                            : 'bg-success/10 text-success'
                        )}
                      >
                        Mặc định
                      </span>
                    )}
                    {isSelected && (
                      <Check
                        className={cn(
                          'h-4 w-4',
                          disabled ? 'text-primary/60' : 'text-primary'
                        )}
                      />
                    )}
                  </div>
                  <p className="text-text-secondary text-sm">
                    {formatted.subtitle}
                  </p>
                  <p className="text-text-secondary text-sm">
                    Chủ TK: {formatted.accountName}
                  </p>
                </div>
              </div>

              {/* ✅ Delete button - hide when disabled */}
              {!disabled && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(method.id);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-text-secondary hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SavedPaymentMethods;
