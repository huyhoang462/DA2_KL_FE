import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateEventField } from '../../../store/slices/eventSlice';
import BankTransferForm from './BankTransferForm';
import MomoForm from './MomoForm';
import PaymentMethodSelector from './PaymentMethodSelector';

export default function PaymentInfoForm({ errors }) {
  const dispatch = useDispatch();

  const payoutMethodData = useSelector(
    (state) => state.event.event.payoutMethod
  );
  const eventData = useSelector((state) => state.event.event);
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
    } else if (selectedMethod === 'momo') {
      fullPath = `payoutMethod.momoDetails.${path}`;
    }

    if (fullPath) {
      dispatch(updateEventField({ field: fullPath, value }));
    }
    console.log('EVENT: ', eventData);
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
              // Truyền xuống chỉ object bankDetails
              data={payoutMethodData?.bankDetails}
              onChange={handleFieldChange}
              errors={errors?.payoutMethod?.bankDetails || {}}
            />
          )}
          {selectedMethod === 'momo' && (
            <MomoForm
              // Truyền xuống chỉ object momoDetails
              data={payoutMethodData.momoDetails}
              onChange={handleFieldChange}
              errors={errors?.payoutMethod?.momoDetails || {}}
            />
          )}
        </div>
      </div>
    </div>
  );
}
