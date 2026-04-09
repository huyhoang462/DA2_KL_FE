import { ImagePlus, X } from 'lucide-react';
import Button from '../../ui/Button';
import Modal from '../../ui/Modal';
import TextArea from '../../ui/TextArea';

const PostComposerModal = ({
  isOpen,
  title = 'Tạo bài viết',
  currentUser,
  roleLabel = '',
  content,
  onContentChange,
  contentLabel = 'Nội dung bài viết',
  contentPlaceholder = '',
  contentMaxLength = 5000,
  contentLengthText = '',
  entityLabel,
  entityValue,
  onEntityChange,
  entityOptions = [],
  entityLoading = false,
  entityLoadingLabel = 'Đang tải... ',
  entityEmptyMessage = '',
  entityError = '',
  images = [],
  onAddImage,
  onRemoveImage,
  addImageLabel = 'Thêm ảnh mẫu',
  error = '',
  onClose,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Đăng bài',
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      xButton
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
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
            <p className="text-text-secondary text-xs">
              {roleLabel || 'Người dùng'}
            </p>
          </div>
        </div>

        <TextArea
          label={contentLabel}
          rows={6}
          value={content}
          onChange={(event) => onContentChange(event.target.value)}
          placeholder={contentPlaceholder}
        />

        <div className="flex justify-end">
          <p className="text-text-secondary text-xs">{contentLengthText}</p>
        </div>

        {entityLabel && (
          <div className="space-y-1.5">
            <label className="text-text-secondary block text-sm font-medium">
              {entityLabel}
            </label>
            <select
              value={entityValue}
              onChange={(event) => onEntityChange(event.target.value)}
              disabled={entityLoading}
              className="bg-background-secondary border-border-default focus:border-primary text-text-primary w-full rounded-lg border px-3 py-2.5 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-70"
            >
              <option value="">
                {entityLoading ? entityLoadingLabel : '-- Chọn --'}
              </option>
              {entityOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {entityError && (
          <p className="text-destructive bg-destructive-background rounded-lg px-3 py-2 text-sm">
            {entityError}
          </p>
        )}

        {!entityLoading &&
          entityEmptyMessage &&
          entityOptions.length === 0 &&
          !entityError && (
            <p className="bg-warning-background text-warning-text-on-subtle rounded-lg px-3 py-2 text-sm">
              {entityEmptyMessage}
            </p>
          )}

        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {images.map((image, index) => (
              <div key={image} className="relative overflow-hidden rounded-lg">
                <img
                  src={image}
                  alt={`composer-${index + 1}`}
                  className="aspect-video w-full object-cover"
                />
                <button
                  onClick={() => onRemoveImage(index)}
                  className="bg-destructive text-destructive-foreground absolute top-2 right-2 rounded-full p-1"
                  aria-label="Xoa anh"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <Button
          variant="secondary"
          onClick={onAddImage}
          className="w-full sm:w-auto"
        >
          <ImagePlus className="mr-2 h-4 w-4" />
          {addImageLabel}
        </Button>

        {error && (
          <p className="text-destructive bg-destructive-background rounded-lg px-3 py-2 text-sm">
            {error}
          </p>
        )}

        <div className="border-border-default flex justify-end gap-3 border-t pt-4">
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

export default PostComposerModal;
