import { useMemo } from 'react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Modal from '../../ui/Modal';
import TextArea from '../../ui/TextArea';
import PendingTicketsTreeSelect, {
  buildPendingTicketMetaMap,
} from './PendingTicketsTreeSelect';

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

  const selectedMetas = useMemo(() => {
    return selectedTicketIds
      .map((ticketId) => ticketMetaMap.get(String(ticketId)))
      .filter(Boolean);
  }, [selectedTicketIds, ticketMetaMap]);

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
            {/* Tree Select Chọn vé + Nhập giá */}
            <PendingTicketsTreeSelect
              label={`${ticketLabel} (${selectedMetas.length})`}
              events={ticketEvents}
              selectedTicketIds={selectedTicketIds}
              onChange={(nextIds) => onSelectedTicketIdsChange?.(nextIds)}
              disabled={ticketLoading}
              loading={ticketLoading}
              loadingLabel={ticketLoadingLabel}
              emptyMessage={ticketEmptyMessage}
              error={ticketError}
              // Truyền thêm props giá xuống TreeSelect
              salePrices={salePrices}
              onSalePriceChange={onSalePriceChange}
              salePriceLabel={salePriceLabel}
              salePricePlaceholder={salePricePlaceholder}
              maxResaleMultiplier={maxResaleMultiplier}
              ticketMetaMap={ticketMetaMap}
            />
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
