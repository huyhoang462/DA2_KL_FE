import { useMemo } from 'react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Modal from '../../ui/Modal';
import TextArea from '../../ui/TextArea';
import { buildPendingTicketMetaMap } from './PendingTicketsTreeSelect';

const getArray = (value) => (Array.isArray(value) ? value : []);

const PostTicketModal = ({
  isOpen,
  title = 'Tạo bài viết',
  currentUser,
  roleLabel = 'customer',
  content,
  walletAddress,
  onContentChange,
  onWalletAddressChange,
  contentLabel = 'Nội dung bài viết',
  walletLabel = 'Ví MetaMask nhận tiền',
  walletPlaceholder = '0x... (42 ký tự)',
  contentPlaceholder = '',
  contentLengthText = '',
  ticketLabel = 'Vé muốn bán',
  ticketEvents = [],
  selectedTicketIds = [],
  onSelectedTicketIdsChange,
  ticketLoading = false,
  ticketLoadingLabel = 'Đang tải vé... ',
  ticketEmptyMessage = '',
  ticketError = '',
  salePrices = {},
  onSalePriceChange,
  salePriceLabel = 'Giá bán lại',
  salePricePlaceholder = 'Nhập giá',
  maxResaleMultiplier,
  error = '',
  onClose,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Đăng bài',
}) => {
  const ticketMetaMap = useMemo(
    () => buildPendingTicketMetaMap(ticketEvents),
    [ticketEvents]
  );

  const selectedSet = useMemo(
    () => new Set(selectedTicketIds.map((id) => String(id))),
    [selectedTicketIds]
  );

  const selectedMetas = useMemo(() => {
    return selectedTicketIds
      .map((ticketId) => ticketMetaMap.get(String(ticketId)))
      .filter(Boolean);
  }, [selectedTicketIds, ticketMetaMap]);

  const lockedEventId = useMemo(() => {
    for (const id of selectedSet) {
      const meta = ticketMetaMap.get(String(id));
      if (meta?.eventId) return String(meta.eventId);
    }
    return '';
  }, [selectedSet, ticketMetaMap]);

  const toggleTicket = (meta) => {
    if (!meta?.ticketId) return;
    if (!onSelectedTicketIdsChange) return;

    const ticketId = String(meta.ticketId);
    const ticketEventId = String(meta.eventId || '');
    const next = new Set(selectedSet);

    if (next.has(ticketId)) {
      next.delete(ticketId);
    } else {
      if (lockedEventId && ticketEventId && ticketEventId !== lockedEventId) {
        return;
      }
      next.add(ticketId);
    }

    onSelectedTicketIdsChange(Array.from(next));
  };

  const ensureSelected = (meta) => {
    if (!meta?.ticketId) return;
    if (!onSelectedTicketIdsChange) return;
    const ticketId = String(meta.ticketId);
    if (selectedSet.has(ticketId)) return;

    const ticketEventId = String(meta.eventId || '');
    if (lockedEventId && ticketEventId && ticketEventId !== lockedEventId) {
      return;
    }

    onSelectedTicketIdsChange(Array.from(new Set([...selectedSet, ticketId])));
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      xButton
      maxWidth="max-w-3xl" // Giảm từ 5xl xuống 3xl vì giờ chỉ còn 1 cột
    >
      <div className="relative flex h-[85vh] flex-col">
        {/* User Info */}

        <div className="mb-4 flex items-center gap-3">
          <img
            src={
              currentUser?.avatar ||
              'https://picsum.photos/seed/post-composer/100/100'
            }
            className="h-9 w-9 rounded-full object-cover"
            alt={currentUser?.name || 'Avatar'}
          />
          <div>
            <p className="text-text-primary text-sm font-semibold">
              {currentUser?.name || currentUser?.fullName || 'Bạn'}
            </p>
            <p className="text-text-secondary text-xs capitalize">
              {roleLabel}
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex min-h-0 flex-col overflow-hidden pb-16">
          <div className="space-y-2 overflow-y-auto pr-1">
            {/* TextArea Nội dung (Đã cho full width và giảm rows) */}
            <div>
              <TextArea
                label={contentLabel}
                rows={3} // Giảm từ 4 xuống 3
                value={content}
                onChange={(event) => onContentChange(event.target.value)}
                placeholder={contentPlaceholder}
                className="w-full"
              />
              {contentLengthText ? (
                <p className="text-text-secondary mt-1 text-right text-xs">
                  {contentLengthText}
                </p>
              ) : null}
            </div>

            <Input
              label={walletLabel}
              value={walletAddress}
              onChange={(event) => onWalletAddressChange?.(event.target.value)}
              placeholder={walletPlaceholder}
            />

            {/* Danh sách sự kiện -> vé (UI giống PostDetailModal) */}
            <div className="space-y-1.5">
              <label className="text-text-secondary block text-sm font-medium">
                {`${ticketLabel} (${selectedMetas.length})`}
              </label>

              {ticketLoading ? (
                <div className="border-border-default bg-background-secondary text-text-secondary rounded-lg border px-3 py-2.5 text-sm">
                  {ticketLoadingLabel}
                </div>
              ) : ticketError ? (
                <div className="text-destructive bg-destructive-background rounded-lg px-3 py-2 text-sm">
                  {ticketError}
                </div>
              ) : null}

              {!ticketLoading &&
              !ticketError &&
              getArray(ticketEvents).length === 0 ? (
                <div className="border-border-default bg-background-secondary text-text-secondary rounded-lg border px-3 py-2.5 text-sm">
                  {ticketEmptyMessage || 'Không có vé nào.'}
                </div>
              ) : null}

              {!ticketLoading && getArray(ticketEvents).length > 0 ? (
                <div className="space-y-4">
                  {getArray(ticketEvents).map((event) => {
                    const eventId = String(event?.eventId || '');
                    const isLockedOut =
                      Boolean(lockedEventId) && eventId !== lockedEventId;

                    const eventTicketMetas = getArray(event?.shows)
                      .flatMap((show) =>
                        getArray(show?.ticketTypes).flatMap((ticketType) =>
                          getArray(ticketType?.tickets)
                            .map((ticket) => String(ticket?.id || ''))
                            .filter(Boolean)
                            .map((ticketId) => ticketMetaMap.get(ticketId))
                            .filter(Boolean)
                        )
                      )
                      .filter(Boolean);

                    return (
                      <div
                        key={eventId || event?.eventName}
                        className={`border-border-default rounded-xl border p-3 ${
                          isLockedOut ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="mb-3 flex items-start gap-3">
                          {event?.bannerImageUrl ? (
                            <img
                              src={event.bannerImageUrl}
                              alt={event?.eventName || 'Sự kiện'}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          ) : null}

                          <div className="min-w-0 flex-1">
                            <p className="text-text-primary line-clamp-1 text-sm font-semibold">
                              {event?.eventName || 'Sự kiện'}
                            </p>
                            {event?.location ? (
                              <p className="text-text-secondary mt-0.5 line-clamp-1 text-xs">
                                {event.location}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        {eventTicketMetas.length === 0 ? (
                          <div className="text-text-secondary text-sm">
                            Không có vé trong sự kiện này.
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2.5">
                            {eventTicketMetas.map((meta) => {
                              const checked = selectedSet.has(
                                String(meta.ticketId)
                              );

                              const cardDisabled = ticketLoading || isLockedOut;

                              const currentSalePrice =
                                salePrices?.[String(meta.ticketId)] ?? '';
                              const maxAllowed =
                                typeof maxResaleMultiplier === 'number'
                                  ? Number(meta.originalPrice || 0) *
                                    maxResaleMultiplier
                                  : undefined;

                              return (
                                <div
                                  key={meta.ticketId}
                                  onClick={() => {
                                    if (cardDisabled) return;
                                    toggleTicket(meta);
                                  }}
                                  className={`flex items-center justify-between rounded-lg border p-3 transition-all ${
                                    cardDisabled
                                      ? 'cursor-not-allowed border-gray-200 bg-gray-100 opacity-70'
                                      : 'border-border-default hover:border-primary cursor-pointer bg-gray-50'
                                  } ${checked ? 'border-primary' : 'border-dashed'}`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-5 items-center">
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        disabled={cardDisabled}
                                        onChange={() => {
                                          if (cardDisabled) return;
                                          toggleTicket(meta);
                                        }}
                                        onClick={(event) =>
                                          event.stopPropagation()
                                        }
                                        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-orange-600 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-30"
                                      />
                                    </div>

                                    <div>
                                      <p className="text-text-primary text-sm font-semibold">
                                        {/* <span className="mr-1">
                                          {String(meta.ticketId).slice(-6)}
                                        </span>
                                        {' - '} */}
                                        {'Vé '}
                                        {meta.ticketTypeName}
                                        {' - '}
                                        {meta.showName}
                                        {' - '}
                                        <span className="text-sm font-bold text-orange-600">
                                          {Number(meta.originalPrice || 0)} USDT
                                        </span>
                                      </p>
                                    </div>
                                  </div>

                                  <div
                                    className="flex items-center gap-1 text-right"
                                    onClick={(event) => event.stopPropagation()}
                                  >
                                    <p className="text-text-secondary text-sm font-bold">
                                      {salePriceLabel}:
                                    </p>

                                    <div className="mt-1 flex items-center justify-end gap-1">
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        max={
                                          typeof maxAllowed === 'number'
                                            ? maxAllowed
                                            : undefined
                                        }
                                        value={currentSalePrice}
                                        disabled={cardDisabled}
                                        onFocus={() => {
                                          if (cardDisabled) return;
                                          ensureSelected(meta);
                                        }}
                                        onChange={(event) => {
                                          if (cardDisabled) return;
                                          ensureSelected(meta);
                                          onSalePriceChange?.(
                                            String(meta.ticketId),
                                            event.target.value
                                          );
                                        }}
                                        placeholder={'0'}
                                        className="text-text-primary focus:border-primary border-border-default w-14 border-b bg-white px-2 py-1 text-sm font-semibold outline-none dark:border-gray-700 dark:bg-transparent"
                                      />
                                      <span className="text-sm font-semibold text-orange-600">
                                        USDT
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="border-border-default absolute right-0 bottom-0 left-0 mt-4 flex justify-between border-t pt-2">
          <div>
            {error ? (
              <p className="text-destructive bg-destructive-background rounded-lg px-3 py-2 text-sm">
                {error}
              </p>
            ) : null}
          </div>
          {/* Footer Buttons */}
          <div className="flex shrink-0 justify-end gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button onClick={onSubmit} loading={isSubmitting}>
              {submitLabel}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PostTicketModal;
