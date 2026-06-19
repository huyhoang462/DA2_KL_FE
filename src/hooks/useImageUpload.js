import { useState } from 'react';
import axiosInstance from '../api/axios';
import axios from 'axios';
import imageCompression from 'browser-image-compression';

const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadImage = async (file) => {
    setIsUploading(true);
    setError(null);

    try {
      // 1. Nén ảnh
      const options = {
        maxSizeMB: 1, // Kích thước tối đa 1MB
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(file, options);
      console.log(`Original size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Compressed size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);

      // 2. Lấy signature
      const signatureResponse = await axiosInstance.get('/uploads/signature');
      const { timestamp, signature, cloudName, apiKey, folder } =
        signatureResponse.data;

      // 3. Upload lên Cloudinary
      const formData = new FormData();
      formData.append('file', compressedFile); // Dùng ảnh đã nén
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', folder);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const cloudinaryResponse = await axios.post(cloudinaryUrl, formData);

      setIsUploading(false);

      return {
        url: cloudinaryResponse.data.secure_url,
        publicId: cloudinaryResponse.data.public_id,
      };
    } catch (err) {
      console.error('Image upload failed:', err);
      const errorMessage =
        err.response?.data?.error?.message || 'Upload failed.';
      setError(errorMessage);
      setIsUploading(false);
      return null;
    }
  };

  const deleteImage = async (publicId) => {
    try {
      await axiosInstance.post('/uploads/delete-image', { publicId });
    } catch (err) {
      console.error('Failed to delete previous image:', err);
    }
  };

  return { uploadImage, deleteImage, isUploading, error };
};

export default useImageUpload;
