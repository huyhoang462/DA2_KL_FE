import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateEventField } from '../../../store/slices/eventSlice';
import Input from '../../ui/Input';
import ImageUploader from '../../ui/ImageUploader';
import RichTextEditor from '../../ui/RichTextEditor';
import LocationInput from './LocationInput';
import CategoryInput from './CategoryInput';
import OrganizerInput from './OrganizerInput';

const uploadToCloudinary = async (file) => {
  console.log(`Bắt đầu upload file: ${file.name}`);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log('Upload thành công!');
  return `https://res.cloudinary.com/demo/image/upload/sample.jpg?timestamp=${Date.now()}`;
};

export default function BasicInfoForm({ errors, onFieldUpdate }) {
  const dispatch = useDispatch();
  const eventData = useSelector((state) => state.event.event);

  const [uploadStatus, setUploadStatus] = useState('idle');

  const handleFieldChange = (field, value) => {
    onFieldUpdate(field, value);
  };

  const handleBannerChange = async (file) => {
    if (file) {
      console.log('File đã được chọn:', file);
      dispatch(
        updateEventField({ field: 'bannerImageUrl', value: file.preview })
      );
      setUploadStatus('uploading');
      try {
        const imageUrl = await uploadToCloudinary(file);

        dispatch(updateEventField({ field: 'bannerImage', value: imageUrl }));
        setUploadStatus('success');
      } catch (error) {
        console.error('Upload failed:', error);
        setUploadStatus('error');
        dispatch(updateEventField({ field: 'bannerImage', value: '' }));
      }
    } else {
      dispatch(updateEventField({ field: 'bannerImageUrl', value: '' }));
      setUploadStatus('idle');
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
          />
        </div>

        <div className="sm:col-span-6">
          <p className="text-text-secondary mb-2 block text-sm font-medium">
            Ảnh bìa sự kiện
          </p>
          <ImageUploader
            value={eventData.bannerImageUrl}
            onChange={handleBannerChange}
            status={uploadStatus}
          />
        </div>
        <div className="sm:col-span-3">
          {/* <DatePicker value={eventData.startDate} onChange={(date) => handleFieldChange('startDate', date)} /> */}
          <Input
            id="eventStartDate"
            type="date"
            label="Ngày bắt đầu"
            value={eventData.startDate}
            onChange={(e) => handleFieldChange('startDate', e.target.value)}
            error={errors?.startDate}
          />
        </div>
        <div className="sm:col-span-3">
          {/* <DatePicker value={eventData.endDate} onChange={(date) => handleFieldChange('endDate', date)} /> */}
          <Input
            id="eventEndDate"
            type="date"
            label="Ngày kết thúc"
            value={eventData.endDate}
            onChange={(e) => handleFieldChange('endDate', e.target.value)}
            error={errors?.endDate}
          />
        </div>

        <div className="sm:col-span-6">
          <p className="text-text-secondary mb-2 block text-sm font-medium">
            Mô tả chi tiết
          </p>
          <RichTextEditor
            value={eventData.description}
            onChange={(e) => handleFieldChange('description', e)}
          />
        </div>

        <div className="sm:col-span-3">
          <CategoryInput
            value={eventData.category}
            onChange={(e) => handleFieldChange('category', e.target.value)}
            error={errors?.category}
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
            className={`bg-background-secondary text-text-primary placeholder-text-placeholder focus:border-primary block w-full rounded-lg border p-2.5 transition outline-none focus:outline-none ${errors?.format ? 'border-destructive' : 'border-border-default'}`}
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

        {eventData.format === 'offline' && (
          <div className="sm:col-span-6">
            <LocationInput
              value={eventData.location}
              onChange={(field, value) =>
                handleFieldChange(`location.${field}`, value)
              }
              error={errors?.location}
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
          />
        </div>
      </div>
    </div>
  );
}
