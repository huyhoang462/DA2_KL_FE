import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import axios from 'axios';
import { X } from 'lucide-react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import TextArea from '../../ui/TextArea';
import { validateTicketType } from '../../../utils/validation';

const DEFAULT_TICKET = {
  name: '',
  price: '',
  quantityTotal: '',
  minPurchase: 1,
  maxPurchase: 10,
  description: '',
  exchangeRateVndPerUsdt: '',
};

const USDT_PRICE_API_URL = 'https://api.coingecko.com/api/v3/simple/price';

const formatVndAmount = (amount) =>
  new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount || 0));

const formatUsdtAmount = (amount) =>
  new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(amount || 0);

export default function TicketTypeFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}) {
  const isEditing = !!initialData;
  const [modalErrors, setModalErrors] = useState({});
  const [isLoadingExchangeRate, setIsLoadingExchangeRate] = useState(false);
  const [exchangeRateError, setExchangeRateError] = useState('');
  const [ticket, setTicket] = useState(DEFAULT_TICKET);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setModalErrors({});
    setExchangeRateError('');

    if (isEditing) {
      setTicket({
        name: initialData.name ?? '',
        price: initialData.price ?? '',
        quantityTotal: initialData.quantityTotal ?? '',
        minPurchase: initialData.minPurchase ?? 1,
        maxPurchase: initialData.maxPurchase ?? 10,
        description: initialData.description ?? '',
        exchangeRateVndPerUsdt: initialData.exchangeRateVndPerUsdt ?? '',
      });
    } else {
      setTicket(DEFAULT_TICKET);
    }
  }, [initialData, isEditing, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    let isActive = true;

    const loadExchangeRate = async () => {
      const fallbackRate = initialData?.exchangeRateVndPerUsdt ?? '';

      setIsLoadingExchangeRate(true);
      try {
        const response = await axios.get(USDT_PRICE_API_URL, {
          params: {
            ids: 'tether',
            vs_currencies: 'vnd',
          },
        });

        const rate = response.data?.tether?.vnd;

        if (!Number.isFinite(rate) || rate <= 0) {
          throw new Error('Invalid exchange rate');
        }

        if (isActive) {
          setTicket((prev) => ({
            ...prev,
            exchangeRateVndPerUsdt: rate,
          }));
          setExchangeRateError('');
        }
      } catch {
        if (isActive && !fallbackRate) {
          setExchangeRateError(
            'Không thể tải tỷ giá USDT/VND hiện tại. Vui lòng thử lại sau.'
          );
        }
      } finally {
        if (isActive) {
          setIsLoadingExchangeRate(false);
        }
      }
    };

    loadExchangeRate();

    return () => {
      isActive = false;
    };
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setModalErrors((pre) => ({ ...pre, [name]: undefined }));
    const processedValue = [
      'price',
      'quantityTotal',
      'minPurchase',
      'maxPurchase',
    ].includes(name)
      ? parseInt(value, 10) || ''
      : value;
    setTicket((prev) => ({ ...prev, [name]: processedValue }));
  };

  const handleSave = () => {
    const validationErrors = validateTicketType(ticket);

    setModalErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onSave(ticket);
    }
  };

  const priceValue = Number(ticket.price);
  const exchangeRateValue = Number(ticket.exchangeRateVndPerUsdt);
  const previewVndValue =
    Number.isFinite(priceValue) &&
    priceValue > 0 &&
    Number.isFinite(exchangeRateValue) &&
    exchangeRateValue > 0
      ? priceValue * exchangeRateValue
      : null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="border-border-default bg-background-secondary data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-60 grid w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 gap-4 border p-6 shadow-lg duration-200 sm:rounded-lg">
          <Dialog.Title className="text-text-primary text-lg font-semibold">
            {isEditing ? 'Chỉnh sửa loại vé' : 'Thêm loại vé mới'}
          </Dialog.Title>

          {/* Form */}
          <div className="grid gap-4 py-4">
            <Input
              id="ticketTypeName"
              label="Tên loại vé"
              name="name"
              value={ticket.name}
              onChange={handleChange}
              placeholder="Ví dụ: Vé VIP"
              error={modalErrors.name}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="ticketTypePrice"
                label="Giá vé (USDT)"
                name="price"
                type="number"
                value={ticket.price}
                onChange={handleChange}
                placeholder="4"
                error={modalErrors.price}
              />
              <Input
                id="ticketTypeTotal"
                label="Tổng số lượng vé"
                name="quantityTotal"
                type="number"
                value={ticket.quantityTotal}
                onChange={handleChange}
                placeholder="100"
                error={modalErrors.quantityTotal}
              />
            </div>
            <div className="border-border-default bg-background-primary rounded-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-text-primary text-sm font-semibold">
                  Tỷ giá USDT/VND hiện tại
                </p>
                {isLoadingExchangeRate ? (
                  <span className="text-text-secondary text-sm">
                    Đang tải...
                  </span>
                ) : exchangeRateValue > 0 ? (
                  <span className="text-text-primary text-sm font-medium">
                    1 USDT = {formatVndAmount(exchangeRateValue)} VND
                  </span>
                ) : (
                  <span className="text-text-secondary text-sm">
                    Chưa có tỷ giá
                  </span>
                )}
              </div>
              {exchangeRateError && (
                <p className="text-destructive mt-2 text-sm">
                  {exchangeRateError}
                </p>
              )}
              {modalErrors.exchangeRateVndPerUsdt && (
                <p className="text-destructive mt-2 text-sm">
                  {modalErrors.exchangeRateVndPerUsdt}
                </p>
              )}
              <div className="text-text-secondary mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <span className="block">Giá vé đã nhập</span>
                  <span className="text-text-primary font-medium">
                    {Number.isFinite(priceValue) && priceValue > 0
                      ? `${formatUsdtAmount(priceValue)} USDT`
                      : 'Chưa nhập'}
                  </span>
                </div>
                <div>
                  <span className="block">Giá quy đổi</span>
                  <span className="text-text-primary font-medium">
                    {previewVndValue !== null
                      ? `${formatVndAmount(previewVndValue)} VND`
                      : 'Nhập giá vé để xem quy đổi'}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="ticketTypeMin"
                label="Mua tối thiểu/đơn"
                name="minPurchase"
                type="number"
                value={ticket.minPurchase}
                onChange={handleChange}
                error={modalErrors.minPurchase}
              />
              <Input
                id="ticketTypeMax"
                label="Mua tối đa/đơn"
                name="maxPurchase"
                type="number"
                value={ticket.maxPurchase}
                onChange={handleChange}
                error={modalErrors.maxPurchase}
              />
            </div>
            <TextArea
              id="ticketTypeDescription"
              label="Mô tả"
              name="description"
              value={ticket.description}
              onChange={handleChange}
              error={modalErrors.description}
            />
          </div>

          <Dialog.Close asChild>
            <button
              className="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>

          <div className="mt-4 flex justify-end gap-4">
            <Dialog.Close asChild>
              <Button type="button" variant="secondary">
                Hủy
              </Button>
            </Dialog.Close>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isLoadingExchangeRate && !ticket.exchangeRateVndPerUsdt}
            >
              Lưu thay đổi
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
