import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateEventField } from '../../../store/slices/eventSlice';
import BankTransferForm from './BankTransferForm';
import MomoForm from './MomoForm';
import PaymentMethodSelector from './PaymentMethodSelector';

export default function PaymentInfoForm({ errors, onChange }) {
  const dispatch = useDispatch();

  const payoutMethodData = useSelector(
    (state) => state.event.event.payoutMethod
  );
  const selectedMethod = payoutMethodData?.methodType || 'bank_account';

  const handleMethodChange = (method) => {
    dispatch(
      updateEventField({ field: 'payoutMethod.methodType', value: method })
    );
  };

  const handleFieldChange = (path, value) => {
    let fullPath;
    if (selectedMethod === 'bank_account') {
      fullPath = `payoutMethod.bankDetails.${path}`;
      onChange(`bankDetails.${path}`);
    } else if (selectedMethod === 'momo') {
      fullPath = `payoutMethod.momoDetails.${path}`;
      onChange(`momoDetails.${path}`);
    }

    if (fullPath) {
      dispatch(updateEventField({ field: fullPath, value }));
    }
  };

  return (
    <div className="mx-auto">
      <div className="mb-8">
        <h2 className="text-text-primary text-lg leading-7 font-semibold">
          Thông tin nhận thanh toán
        </h2>
        <p className="text-text-secondary mt-1 text-sm">
          Chọn phương thức bạn muốn nhận tiền sau khi sự kiện kết thúc.
        </p>
      </div>

      <div className="space-y-8">
        <PaymentMethodSelector
          selectedMethod={selectedMethod}
          onSelect={handleMethodChange}
        />

        <div className="border-border-default border-t pt-8">
          {selectedMethod === 'bank_account' && (
            <BankTransferForm
              data={payoutMethodData?.bankDetails}
              onChange={handleFieldChange}
              errors={errors?.bankDetails || {}}
            />
          )}
          {selectedMethod === 'momo' && (
            <MomoForm
              data={payoutMethodData.momoDetails}
              onChange={handleFieldChange}
              errors={errors?.momoDetails || {}}
            />
          )}
        </div>
      </div>
    </div>
  );
}
