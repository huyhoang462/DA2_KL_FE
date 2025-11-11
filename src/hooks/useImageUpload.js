import { useState } from 'react';
import axiosInstance from '../api/axios';
import axios from 'axios';

const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadImage = async (file) => {
    setIsUploading(true);
    setError(null);

    try {
      const signatureResponse = await axiosInstance.get('/uploads/signature');
      const { timestamp, signature, cloudName, apiKey, folder } =
        signatureResponse.data;

      const formData = new FormData();
      formData.append('file', file);
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
