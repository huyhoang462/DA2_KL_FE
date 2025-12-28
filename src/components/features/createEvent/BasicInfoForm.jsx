import Input from '../../ui/Input';
import ImageUploader from '../../ui/ImageUploader';
import RichTextEditor from '../../ui/RichTextEditor';
import LocationInput from './LocationInput';
import CategoryInput from './CategoryInput';
import OrganizerInput from './OrganizerInput';
import useImageUpload from '../../../hooks/useImageUpload';
import { is } from 'date-fns/locale/is';

export default function BasicInfoForm({
  value: eventData,
  onChange,
  errors,
  isEditable = true,
}) {
  const {
    uploadImage,
    deleteImage,
    isUploading,
    error: uploadError,
  } = useImageUpload();

  const bannerImage = eventData.bannerImageUrl || { url: '', publicId: '' };

  const handleFieldChange = (field, value) => {
    if (!isEditable) return;
    onChange(field, value);
  };

  const handleBannerChange = async (file) => {
    if (!file) {
      if (bannerImage.publicId) await deleteImage(bannerImage.publicId);
      onChange('bannerImageUrl', { url: '', publicId: '' });
      return;
    }

    if (bannerImage.publicId) await deleteImage(bannerImage.publicId);

    onChange('bannerImageUrl', { url: file.preview, publicId: '' });

    try {
      const uploadedImage = await uploadImage(file);
      if (uploadedImage) {
        onChange('bannerImageUrl', {
          url: uploadedImage.url,
          publicId: uploadedImage.publicId,
        });
      }
    } catch (error) {
      console.error('Upload failed:', error);
      onChange('bannerImageUrl', { url: '', publicId: '' });
    }
  };

  return (
    <div className="mx-auto">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-6">
        <div className="sm:col-span-6">
          <Input
            id="eventName"
            label="Tên sự kiện"
            placeholder="Ví dụ: Đại nhạc hội Mùa hè 2024"
            maxLength={100}
            value={eventData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            error={errors?.name}
            disabled={!isEditable}
          />
        </div>

        <div className="sm:col-span-6">
          <p className="text-text-secondary mb-2 block text-sm font-medium">
            Ảnh bìa sự kiện
          </p>
          <ImageUploader
            disabled={!isEditable}
            value={bannerImage.url}
            onChange={handleBannerChange}
            status={isUploading ? 'uploading' : uploadError ? 'error' : 'idle'}
          />
          {uploadError && (
            <p className="text-destructive mt-2 text-sm">{uploadError}</p>
          )}
        </div>

        {/* <div className="sm:col-span-3">
          <Input
            id="eventStartDate"
            type="date"
            label="Ngày bắt đầu"
            value={eventData.startDate}
            onChange={(e) => handleFieldChange('startDate', e.target.value)}
            error={errors?.startDate}
            disabled={!isEditable}
          />
        </div>
        <div className="sm:col-span-3">
          <Input
            id="eventEndDate"
            type="date"
            label="Ngày kết thúc"
            value={eventData.endDate}
            onChange={(e) => handleFieldChange('endDate', e.target.value)}
            error={errors?.endDate}
            disabled={!isEditable}
          />
        </div> */}

        <div className="sm:col-span-6">
          <p className="text-text-secondary mb-2 block text-sm font-medium">
            Mô tả chi tiết
          </p>
          <RichTextEditor
            value={eventData.description}
            onChange={(e) => handleFieldChange('description', e)}
            disabled={!isEditable}
          />
        </div>

        <div className="sm:col-span-3">
          <CategoryInput
            value={eventData.category}
            onChange={(e) => handleFieldChange('category', e.target.value)}
            error={errors?.category}
            disabled={!isEditable}
          />
        </div>

        <div className="sm:col-span-3">
          <label
            htmlFor="eventFormat"
            className="text-text-secondary mb-2 block text-sm font-medium"
          >
            Hình thức tổ chức
          </label>
          <select
            id="eventFormat"
            value={eventData.format}
            onChange={(e) => handleFieldChange('format', e.target.value)}
            disabled={!isEditable}
            className={`bg-background-secondary text-text-primary placeholder-text-placeholder focus:border-primary block w-full rounded-lg border p-2.5 transition outline-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-80 ${errors?.format ? 'border-destructive' : 'border-border-default'}`}
          >
            <option value="offline">Offline (Tại địa điểm)</option>
            <option value="online">Online</option>
          </select>
          {errors?.format && (
            <div className="text-destructive mt-1 text-xs">
              {errors?.format}
            </div>
          )}
        </div>

        {eventData.format === 'online' ? (
          <></>
        ) : (
          <div className="sm:col-span-6">
            <LocationInput
              value={eventData.location}
              onChange={(field, value) =>
                handleFieldChange(`location.${field}`, value)
              }
              error={errors?.location}
              disabled={!isEditable}
            />
          </div>
        )}
        <div className="sm:col-span-6">
          <OrganizerInput
            value={eventData.organizer}
            onChange={(field, value) =>
              handleFieldChange(`organizer.${field}`, value)
            }
            error={errors?.organizer}
            disabled={!isEditable}
          />
        </div>
      </div>
    </div>
  );
}
