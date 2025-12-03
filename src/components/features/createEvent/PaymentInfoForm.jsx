import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Plus } from 'lucide-react';
import BankTransferForm from './BankTransferForm';
import MomoForm from './MomoForm';
import PaymentMethodSelector from './PaymentMethodSelector';
import SavedPaymentMethods from './SavedPaymentMethods';
import LoadingSpinner from '../../ui/LoadingSpinner';
import ConfirmModal from '../../ui/ConfirmModal';
import {
  getMyPayoutMethods,
  deletePayoutMethod,
} from '../../../services/paymentService';

export default function PaymentInfoForm({
  value: payoutMethodData,
  onChange,
  errors,
  isEditable = true,
}) {
  const [activeTab, setActiveTab] = useState('saved');
  const [selectedSavedMethod, setSelectedSavedMethod] = useState(null);
  const [deletingMethodId, setDeletingMethodId] = useState(null);
  const [lastSelectedSavedMethodId, setLastSelectedSavedMethodId] =
    useState(null);

  const queryClient = useQueryClient();
  const isInitializedRef = useRef(false);

  const { data: savedMethods, isLoading } = useQuery({
    queryKey: ['myPayoutMethods'],
    queryFn: getMyPayoutMethods,
  });

  const deleteMutation = useMutation({
    mutationFn: deletePayoutMethod,
    onSuccess: () => {
      queryClient.invalidateQueries(['myPayoutMethods']);
      setDeletingMethodId(null);
    },
  });

  useEffect(() => {
    if (isInitializedRef.current) return;

    const hasSavedMethods = savedMethods && savedMethods.length > 0;
    const hasExistingPayoutId = payoutMethodData?.id;

    if (hasExistingPayoutId) {
      if (hasSavedMethods) {
        const existingMethod = savedMethods.find(
          (m) => m.id === payoutMethodData.id
        );
        if (existingMethod) {
          setSelectedSavedMethod(existingMethod);
          setActiveTab('saved');
          isInitializedRef.current = true;
        }
      }

      return;
    } else setActiveTab('create');

    isInitializedRef.current = true;
  }, [savedMethods, payoutMethodData?.id]);

  const selectedMethod = payoutMethodData?.methodType || 'bank_account';

  const handleMethodChange = (method) => {
    onChange('payoutMethod.methodType', method);

    if (method === 'bank_account') {
      onChange('payoutMethod.momoDetails', {
        phoneNumber: '',
        accountName: '',
      });
    } else if (method === 'momo') {
      onChange('payoutMethod.bankDetails', {
        bankName: '',
        accountNumber: '',
        accountName: '',
        bankBranch: '',
      });
    }
  };

  const handleFieldChange = (path, value) => {
    let fullPath;
    if (selectedMethod === 'bank_account') {
      fullPath = `payoutMethod.bankDetails.${path}`;
    } else if (selectedMethod === 'momo') {
      fullPath = `payoutMethod.momoDetails.${path}`;
    }
    if (fullPath) {
      onChange(fullPath, value);
    }
  };

  const handleSelectSavedMethod = (method) => {
    setSelectedSavedMethod(method);
    setLastSelectedSavedMethodId(method.id);

    onChange('payoutMethod.methodType', method.methodType);
    onChange('payoutMethod.id', method.id);

    if (method.methodType === 'bank_account') {
      onChange('payoutMethod.momoDetails', {
        phoneNumber: '',
        accountName: '',
      });

      Object.entries(method.bankDetails).forEach(([key, value]) => {
        onChange(`payoutMethod.bankDetails.${key}`, value);
      });
    } else if (method.methodType === 'momo') {
      onChange('payoutMethod.bankDetails', {
        bankName: '',
        accountNumber: '',
        accountName: '',
        bankBranch: '',
      });

      Object.entries(method.momoDetails).forEach(([key, value]) => {
        onChange(`payoutMethod.momoDetails.${key}`, value);
      });
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    if (tab === 'create') {
      setSelectedSavedMethod(null);

      onChange('payoutMethod.id', null);

      if (
        !payoutMethodData ||
        (!payoutMethodData.bankDetails && !payoutMethodData.momoDetails)
      ) {
        onChange('payoutMethod.methodType', 'bank_account');
      }
    } else if (tab === 'saved') {
      if (savedMethods && savedMethods.length > 0) {
        let methodToSelect = null;

        // ✅ Ưu tiên tìm theo lastSelectedSavedMethodId trước
        if (lastSelectedSavedMethodId) {
          methodToSelect = savedMethods.find(
            (m) => m.id === lastSelectedSavedMethodId
          );
        }

        // ✅ Fallback: tìm theo ID hiện tại trong form data
        if (!methodToSelect) {
          const currentId = payoutMethodData?.id;
          if (currentId) {
            methodToSelect = savedMethods.find((m) => m.id === currentId);
          }
        }

        // ✅ Fallback cuối: chọn method đầu tiên
        if (!methodToSelect) {
          methodToSelect = savedMethods[0];
          // ✅ Update lastSelectedSavedMethodId khi fallback
          setLastSelectedSavedMethodId(methodToSelect.id);
        }

        if (methodToSelect) {
          handleSelectSavedMethod(methodToSelect);
        }
      }
    }
  };

  const handleDeleteMethod = (methodId) => {
    setDeletingMethodId(methodId);
  };

  const confirmDelete = () => {
    if (deletingMethodId) {
      deleteMutation.mutate(deletingMethodId);

      if (selectedSavedMethod?.id === deletingMethodId) {
        setSelectedSavedMethod(null);
        setActiveTab('create');
      }
    }
  };

  if (isLoading) {
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
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const hasSavedMethods = savedMethods && savedMethods.length > 0;

  return (
    <div className="mx-auto">
      {isEditable && (
        <div className="mb-2">
          <h2 className="text-text-primary text-lg leading-7 font-semibold">
            Thông tin nhận thanh toán
          </h2>
          <p className="text-text-secondary mt-1 text-sm">
            Chọn phương thức bạn muốn nhận tiền sau khi sự kiện kết thúc.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Tabs */}
        <div className="border-border-default border-b">
          <div className="flex space-x-0">
            {hasSavedMethods && (
              <button
                onClick={() => handleTabChange('saved')}
                className={`border-border-default flex cursor-pointer items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'saved'
                    ? 'border-primary text-primary'
                    : 'text-text-secondary hover:text-text-primary border-transparent'
                }`}
              >
                <CreditCard className="h-4 w-4" />
                Chọn từ danh sách có sẵn ({savedMethods.length})
              </button>
            )}
            {isEditable && (
              <button
                onClick={() => handleTabChange('create')}
                className={`border-border-default flex cursor-pointer items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'create'
                    ? 'border-primary text-primary'
                    : 'text-text-secondary hover:text-text-primary border-transparent'
                }`}
              >
                <Plus className="h-4 w-4" />
                {hasSavedMethods
                  ? 'Tạo phương thức mới'
                  : 'Tạo phương thức thanh toán'}
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'saved' ? (
            <SavedPaymentMethods
              payoutMethods={savedMethods}
              selectedMethodId={selectedSavedMethod?.id}
              onSelect={handleSelectSavedMethod}
              onDelete={handleDeleteMethod}
              onCreateNew={() => handleTabChange('create')}
              disabled={!isEditable}
            />
          ) : isEditable === true ? (
            <div className="space-y-6">
              <PaymentMethodSelector
                selectedMethod={selectedMethod}
                onSelect={handleMethodChange}
              />

              <div className="border-border-default border-t pt-6">
                {selectedMethod === 'bank_account' && (
                  <BankTransferForm
                    data={payoutMethodData?.bankDetails}
                    onChange={handleFieldChange}
                    errors={errors?.bankDetails || {}}
                  />
                )}
                {selectedMethod === 'momo' && (
                  <MomoForm
                    data={payoutMethodData?.momoDetails}
                    onChange={handleFieldChange}
                    errors={errors?.momoDetails || {}}
                  />
                )}
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deletingMethodId}
        title="Xác nhận xóa phương thức"
        message="Bạn có chắc chắn muốn xóa phương thức thanh toán này? Hành động này không thể hoàn tác."
        onConfirm={confirmDelete}
        onCancel={() => setDeletingMethodId(null)}
        confirmText="Xóa"
        confirmVariant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
