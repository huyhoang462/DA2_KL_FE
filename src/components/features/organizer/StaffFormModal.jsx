// src/pages/dashboard/check-in-staff/partials/StaffFormModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import Input from '../../ui/Input';

export default function StaffFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isSaving,
}) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        fullName: initialData.fullName || '',
        email: initialData.email || '',
        password: '', // Không hiển thị password cũ
      });
    } else {
      setFormData({ fullName: '', email: '', password: '' });
    }
  }, [initialData, isEditMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên.';
    if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email.';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Email không hợp lệ.';
    if (!isEditMode && !formData.password)
      newErrors.password = 'Vui lòng nhập mật khẩu.';
    else if (!isEditMode && formData.password.length < 6)
      newErrors.password = 'Mật khẩu cần ít nhất 6 ký tự.';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Chỉ gửi những dữ liệu cần thiết
    const dataToSave = {
      fullName: formData.fullName,
      email: formData.email,
    };
    if (formData.password) {
      // Chỉ gửi password nếu được nhập (cho tạo mới hoặc đổi mk)
      dataToSave.password = formData.password;
    }

    onSave(dataToSave);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Chỉnh sửa tài khoản' : 'Tạo tài khoản nhân viên mới'}
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 p-6">
          <Input
            label="Họ và tên"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />
          <Input
            label={
              isEditMode ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'
            }
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />
        </div>
        <div className="border-border-default bg-background-primary flex items-center justify-end gap-4 border-t p-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
