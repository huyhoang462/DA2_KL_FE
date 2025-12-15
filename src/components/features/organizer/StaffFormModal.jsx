// src/pages/dashboard/check-in-staff/partials/StaffFormModal.jsx
import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Info } from 'lucide-react';
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
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
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
      title={
        isEditMode
          ? 'Chỉnh sửa thông tin nhân viên'
          : 'Tạo tài khoản nhân viên mới'
      }
      size="md"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-6 p-6">
          {/* Description */}
          <div className="bg-primary/5 border-primary/20 flex items-start gap-3 rounded-lg border p-4">
            <Info className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="text-text-primary text-sm font-medium">
                {isEditMode
                  ? 'Cập nhật thông tin tài khoản nhân viên'
                  : 'Tạo tài khoản mới cho nhân viên check-in'}
              </p>
              <p className="text-text-secondary mt-1 text-xs">
                {isEditMode
                  ? 'Chỉ cập nhật những trường cần thiết. Để trống mật khẩu nếu không muốn thay đổi.'
                  : 'Nhân viên sẽ sử dụng email và mật khẩu này để đăng nhập và thực hiện check-in.'}
              </p>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="text-text-primary mb-2 block text-sm font-medium">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Họ và tên
                <span className="text-destructive">*</span>
              </div>
            </label>
            <Input
              name="fullName"
              placeholder="Nhập họ và tên nhân viên"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-text-primary mb-2 block text-sm font-medium">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
                <span className="text-destructive">*</span>
              </div>
            </label>
            <Input
              name="email"
              type="email"
              placeholder="nhân viên@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              disabled={isEditMode} // Cannot change email in edit mode
            />
            {isEditMode && (
              <p className="text-text-secondary mt-1 text-xs">
                Email không thể thay đổi
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-text-primary mb-2 block text-sm font-medium">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                {isEditMode ? 'Mật khẩu mới' : 'Mật khẩu'}
                {!isEditMode && <span className="text-destructive">*</span>}
              </div>
            </label>
            <Input
              name="password"
              type="password"
              placeholder={
                isEditMode
                  ? 'Để trống nếu không muốn đổi mật khẩu'
                  : 'Nhập mật khẩu (tối thiểu 6 ký tự)'
              }
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-border-default bg-background-primary flex items-center justify-end gap-3 border-t p-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSaving}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving
              ? 'Đang lưu...'
              : isEditMode
                ? 'Cập nhật'
                : 'Tạo tài khoản'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
