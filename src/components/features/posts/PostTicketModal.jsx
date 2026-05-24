import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Modal from '../../ui/Modal';
import TextArea from '../../ui/TextArea';
import useClickOutside from '../../../hooks/useClickOutside';

const formatUtcTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const formatUtcDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

const getTicketLocationText = (ticket) => {
  if (!ticket) return '';
  if ((ticket.format || '').toLowerCase() === 'online') return 'Online';
  return ticket.location || 'Offline';
};

const TicketOptionCard = ({ ticket, isSelected, onSelect }) => {
  const priceText =
    typeof ticket?.price === 'number'
      ? `${ticket.price} USDT`
      : ticket?.price
        ? `${ticket.price} USDT`
        : '0 USDT';

  const startTimeText = formatUtcTime(ticket?.startTime);
  const endTimeText = formatUtcTime(ticket?.endTime);
  const dateText = formatUtcDate(ticket?.startTime);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        `border-border-default hover:bg-foreground flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ` +
        (isSelected ? 'bg-foreground' : 'bg-background-secondary')
      }
    >
      <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-200">
        {ticket?.bannerImageUrl ? (
          <img
            src={ticket.bannerImageUrl}
            alt={ticket.eventName || 'Ticket'}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-text-primary line-clamp-1 text-sm font-semibold">
          {ticket?.eventName || 'Vé sự kiện'}
        </div>
        <div className="text-text-secondary line-clamp-1 text-xs">
          {ticket?.showName || 'Suất diễn'} ·{' '}
          {ticket?.ticketTypeName || 'Loại vé'}
        </div>
        <div className="text-text-secondary mt-1 line-clamp-1 text-xs">
          {dateText}{' '}
          {startTimeText && endTimeText
            ? `(${startTimeText} - ${endTimeText})`
            : ''}{' '}
          · {getTicketLocationText(ticket)}
        </div>
      </div>

      <div className="text-text-primary flex-shrink-0 text-right">
        <div className="text-sm font-semibold">{priceText}</div>
      </div>
    </button>
  );
};

const TicketSelect = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
  loading = false,
  loadingLabel = 'Đang tải... ',
  emptyMessage = '',
  error = '',
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useClickOutside(() => setOpen(false));

  const selectedTicket = useMemo(() => {
    if (!value) return null;
    return (
      options.find((ticket) => String(ticket.id) === String(value)) || null
    );
  }, [options, value]);

  return (
    <div className="space-y-1.5">
      {label ? (
        <label className="text-text-secondary block text-sm font-medium">
          {label}
        </label>
      ) : null}

      <div ref={wrapperRef} className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
          className={
            'bg-background-secondary border-border-default focus:border-primary text-text-primary flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-70'
          }
        >
          <span className="truncate">
            {loading
              ? loadingLabel
              : selectedTicket
                ? `${selectedTicket.eventName || 'Vé sự kiện'} - ${selectedTicket.showName || 'Suất diễn'} - ${selectedTicket.ticketTypeName || 'Loại vé'}`
                : '-- Chọn vé --'}
          </span>
          <ChevronDown className="text-text-secondary h-4 w-4" />
        </button>

        {open && !disabled && !loading ? (
          <div className="border-border-default bg-background-secondary absolute z-50 mt-2 w-full overflow-hidden rounded-lg border shadow-xl">
            <div className="max-h-72 space-y-2 overflow-auto p-2">
              {options.length === 0 ? (
                <div className="text-text-secondary px-2 py-3 text-sm">
                  {emptyMessage || 'Không có vé nào.'}
                </div>
              ) : (
                options.map((ticket) => (
                  <TicketOptionCard
                    key={ticket.id}
                    ticket={ticket}
                    isSelected={String(ticket.id) === String(value)}
                    onSelect={() => {
                      onChange?.({ticketId:ticket.id,eventId:ticket.eventId});
                      setOpen(false);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="text-destructive bg-destructive-background rounded-lg px-3 py-2 text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
};

const PostTicketModal = ({
  isOpen,
  title = 'Tạo bài viết',
  currentUser,
  roleLabel = 'customer',
  content,
  onContentChange,
  contentLabel = 'Nội dung bài viết',
  contentPlaceholder = '',
  contentLengthText = '',
  ticketLabel = 'Vé muốn bán',
  ticketValue,
  onTicketChange,
  ticketOptions = [],
  ticketLoading = false,
  ticketLoadingLabel = 'Đang tải vé... ',
  ticketEmptyMessage = '',
  ticketError = '',
  salePrice = '',
  onSalePriceChange,
  salePriceLabel = 'Giá bán lại',
  salePricePlaceholder = 'Nhập giá muốn bán lại',
  error = '',
  onClose,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Đăng bài',
}) => {
  if (!isOpen) return null;

  const selectedTicket = useMemo(() => {
    if (!ticketValue) return null;
    return (
      ticketOptions.find(
        (ticket) => String(ticket.id) === String(ticketValue)
      ) || null
    );
  }, [ticketOptions, ticketValue]);

  const originalPriceText = selectedTicket
    ? `${typeof selectedTicket.price === 'number' ? selectedTicket.price : selectedTicket.price || 0} USDT`
    : '';

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      xButton
      maxWidth="max-w-2xl"
    >
      <div>
        <div className="mb-4 flex items-center gap-3">
          <img
            src={
              currentUser?.avatar ||
              'https://picsum.photos/seed/post-composer/100/100'
            }
            className="h-11 w-11 rounded-full object-cover"
            alt={currentUser?.name || 'Avatar'}
          />
          <div>
            <p className="text-text-primary text-sm font-semibold">
              {currentUser?.name || currentUser?.fullName || 'Bạn'}
            </p>
            <p className="text-text-secondary text-xs">{roleLabel}</p>
          </div>
        </div>

        <TextArea
          label={contentLabel}
          rows={3}
          value={content}
          onChange={(event) => onContentChange(event.target.value)}
          placeholder={contentPlaceholder}
        />

        <div className="my-2 flex justify-end">
          <p className="text-text-secondary text-xs">{contentLengthText}</p>
        </div>

        <TicketSelect
          label={ticketLabel}
          value={ticketValue}
          onChange={onTicketChange}
          options={ticketOptions}
          disabled={ticketLoading}
          loading={ticketLoading}
          loadingLabel={ticketLoadingLabel}
          emptyMessage={ticketEmptyMessage}
          error={ticketError}
        />

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Input disabled value={originalPriceText} label="Giá gốc" />
          <Input
            type="number"
            min="0"
            step="1"
            value={salePrice}
            onChange={(event) => onSalePriceChange?.(event.target.value)}
            placeholder={salePricePlaceholder}
            label={salePriceLabel}
          />
        </div>

        {selectedTicket ? (
          <div className="text-text-secondary mt-2 text-xs">
            {formatUtcDate(selectedTicket.startTime)}{' '}
            {formatUtcTime(selectedTicket.startTime)} -{' '}
            {formatUtcTime(selectedTicket.endTime)} ·{' '}
            {getTicketLocationText(selectedTicket)}
          </div>
        ) : null}

        {error ? (
          <p className="text-destructive bg-destructive-background mt-3 rounded-lg px-3 py-2 text-sm">
            {error}
          </p>
        ) : null}

        <div className="border-border-default mt-4 flex justify-end gap-3 border-t pt-4">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button onClick={onSubmit} loading={isSubmitting}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PostTicketModal;
