// src/components/ui/ImageUploader.jsx

import React, { useCallback, useEffect, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, LoaderCircle } from 'lucide-react';
import { cn } from '../../utils/lib';

// Props mà component này sẽ nhận từ cha
// - value: URL ảnh hiện tại (nếu có) hoặc object File (khi vừa chọn)
// - onChange: Hàm callback để thông báo cho cha khi có file mới hoặc khi file bị xóa
// - className: Cho phép tùy biến style từ bên ngoài

export default function ImageUploader({
  value,
  onChange,
  className,
  status = 'idle',
}) {
  // onDrop là hàm sẽ được gọi khi người dùng thả file hoặc chọn file
  const onDrop = useCallback(
    (acceptedFiles) => {
      // react-dropzone có thể nhận nhiều file, nhưng ta chỉ lấy file đầu tiên
      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        // Tạo một URL tạm thời để có thể xem trước ảnh
        const fileWithPreview = Object.assign(file, {
          preview: URL.createObjectURL(file),
        });
        // Gọi hàm onChange của cha, truyền file mới lên
        onChange(fileWithPreview);
      }
    },
    [onChange]
  );

  // Cấu hình cho dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/gif': [],
      'image/webp': [],
    },
    multiple: false, // Chỉ cho phép chọn 1 file
  });

  // Tạo URL preview một cách an toàn
  const previewUrl = useMemo(() => {
    if (typeof value === 'string') {
      return value; // Nếu value là URL từ server (khi sửa sự kiện)
    }
    if (value && value.preview) {
      return value.preview; // Nếu value là object File khi vừa chọn
    }
    return null;
  }, [value]);

  // Hàm xử lý khi nhấn nút xóa ảnh
  const handleRemoveImage = (e) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra dropzone
    onChange(null); // Thông báo cho cha rằng ảnh đã bị xóa
  };

  // Cleanup: Giải phóng URL tạm thời khi component unmount để tránh rò rỉ bộ nhớ
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div
      {...getRootProps()}
      className={cn(
        'group border-border-default relative flex aspect-[16/7] w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors',
        'hover:border-primary hover:bg-foreground',
        isDragActive && 'border-primary bg-primary/10',
        previewUrl && 'border-solid',
        status === 'uploading' && 'cursor-not-allowed opacity-75',
        className
      )}
    >
      <input
        id="image-upload"
        {...getInputProps()}
        disabled={status === 'uploading'}
      />

      {previewUrl ? (
        <>
          <img
            src={previewUrl}
            alt="Preview"
            className="h-full w-full rounded-md object-cover"
          />
          {status === 'uploading' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-md bg-black/70 transition-opacity">
              <LoaderCircle className="h-8 w-8 animate-spin text-white" />
              <p className="mt-2 text-sm text-white">Đang tải lên...</p>
            </div>
          )}
          {status !== 'uploading' && (
            <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <p className="text-sm text-white">
                Nhấn hoặc kéo ảnh khác để thay thế
              </p>
            </div>
          )}
          {status !== 'uploading' && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="bg-background-secondary/80 text-text-primary hover:bg-destructive hover:text-destructive-foreground absolute top-2 right-2 rounded-full p-1.5 transition-colors"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </>
      ) : (
        // --- Giao diện khi chưa có ảnh ---
        <div className="text-text-secondary text-center">
          <UploadCloud className="mx-auto h-12 w-12" />
          <p className="mt-4 text-sm">
            <span className="text-primary font-semibold">Nhấn để tải lên</span>{' '}
            hoặc kéo và thả
          </p>
          <p className="text-xs">PNG, JPG, GIF (tối đa 10MB)</p>
          <p className="text-xs">Tỷ lệ khuyến nghị: 16:7</p>
        </div>
      )}
    </div>
  );
}
