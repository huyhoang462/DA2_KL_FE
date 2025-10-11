import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Eye, EyeClosed, Pencil, Save } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { handleChangePassword } from '../../services/authService';

const ProfilePage = () => {
  const user = useSelector((state) => state.auth.user);

  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [infoError, setInfoError] = useState({});
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoSuccess, setInfoSuccess] = useState('');

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwError, setPwError] = useState({});
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');

  const validatePhone = (phone) => /^0\d{9,10}$/.test(phone);

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    let errors = {};
    if (!fullName.trim()) errors.fullName = 'Vui lòng nhập họ tên.';
    if (!phone.trim()) errors.phone = 'Vui lòng nhập số điện thoại.';
    else if (!validatePhone(phone))
      errors.phone = 'Số điện thoại không hợp lệ.';
    setInfoError(errors);
    if (Object.keys(errors).length > 0) return;

    setInfoLoading(true);
    setInfoSuccess('');
    setTimeout(() => {
      setInfoLoading(false);
      setEditMode(false);
      setInfoSuccess('Cập nhật thông tin thành công!');
    }, 1200);
  };

  const onChangePassword = async (e) => {
    e.preventDefault();
    let errors = {};
    if (!oldPassword) errors.oldPassword = 'Nhập mật khẩu hiện tại.';
    if (!newPassword) errors.newPassword = 'Nhập mật khẩu mới.';
    else if (newPassword.length < 6)
      errors.newPassword = 'Mật khẩu mới tối thiểu 6 ký tự.';
    else if (newPassword === oldPassword)
      errors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại.';
    if (!confirmPassword) errors.confirmPassword = 'Nhập lại mật khẩu mới.';
    else if (newPassword !== confirmPassword)
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    setPwError(errors);
    if (Object.keys(errors).length > 0) return;

    setPwLoading(true);
    setPwSuccess('');
    try {
      const res = await handleChangePassword({
        userId: user?.id,
        oldPassword,
        newPassword,
      });
      setPwLoading(false);
      setShowChangePassword(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPwSuccess(res?.message || 'Đổi mật khẩu thành công!');
    } catch (err) {
      setPwLoading(false);
      setPwError({ api: err?.message || 'Có lỗi xảy ra.' });
    }
  };

  return (
    <div className="mx-auto">
      <div className="bg-background-secondary mb-8 rounded-2xl p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-primary text-xl font-bold">
            Thông tin tài khoản
          </h2>
          {!editMode ? (
            <button
              className="text-primary hover:bg-primary/10 flex cursor-pointer items-center gap-1 rounded px-3 py-1.5 text-sm font-medium transition"
              onClick={() => {
                setEditMode(true);
                setInfoSuccess('');
              }}
            >
              <Pencil className="h-4 w-4" />
              Chỉnh sửa
            </button>
          ) : (
            <Button
              type="button"
              size="sm"
              className="flex items-center gap-1"
              loading={infoLoading}
              onClick={handleSaveInfo}
            >
              <Save className="h-4 w-4" />
              Lưu
            </Button>
          )}
        </div>
        <form onSubmit={handleSaveInfo} className="space-y-4">
          <Input
            id="email"
            label="Email"
            value={user?.email || ''}
            disabled
            inputClassName="bg-gray-100 cursor-not-allowed"
          />
          <Input
            id="fullName"
            label="Họ tên"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={!editMode || infoLoading}
            error={infoError.fullName}
          />
          <Input
            id="phone"
            label="Số điện thoại"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={!editMode || infoLoading}
            error={infoError.phone}
          />
        </form>
        {infoSuccess && (
          <div className="bg-success-background text-success mt-4 rounded px-4 py-2">
            {infoSuccess}
          </div>
        )}
      </div>

      {/* Đổi mật khẩu */}
      <div className="bg-background-secondary rounded-2xl p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-primary text-xl font-bold">Đổi mật khẩu</h2>
          {!showChangePassword && (
            <button
              className="text-primary hover:bg-primary/10 flex cursor-pointer items-center gap-1 rounded px-3 py-1.5 text-sm font-medium transition"
              onClick={() => {
                setShowChangePassword(true);
                setPwSuccess('');
              }}
            >
              <Pencil className="h-4 w-4" />
              Đổi mật khẩu
            </button>
          )}
        </div>
        {showChangePassword ? (
          <form onSubmit={onChangePassword} className="space-y-4">
            <div className="relative">
              <Input
                id="oldPassword"
                label="Mật khẩu hiện tại"
                type={showOld ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                error={pwError.oldPassword}
                disabled={pwLoading}
                inputClassName="pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                className="text-text-secondary hover:text-primary absolute top-9 right-3"
                onClick={() => setShowOld((v) => !v)}
                disabled={pwLoading}
              >
                {showOld ? (
                  <EyeClosed className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <div className="relative">
              <Input
                id="newPassword"
                label="Mật khẩu mới"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={pwError.newPassword}
                disabled={pwLoading}
                inputClassName="pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                className="text-text-secondary hover:text-primary absolute top-9 right-3"
                onClick={() => setShowNew((v) => !v)}
                disabled={pwLoading}
              >
                {showNew ? (
                  <EyeClosed className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <div className="relative">
              <Input
                id="confirmPassword"
                label="Xác nhận mật khẩu mới"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={pwError.confirmPassword}
                disabled={pwLoading}
                inputClassName="pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                className="text-text-secondary hover:text-primary absolute top-9 right-3"
                onClick={() => setShowConfirm((v) => !v)}
                disabled={pwLoading}
              >
                {showConfirm ? (
                  <EyeClosed className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                loading={pwLoading}
                className="w-full"
                disabled={pwLoading}
              >
                Lưu mật khẩu mới
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={pwLoading}
                onClick={() => {
                  setShowChangePassword(false);
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setPwError({});
                }}
              >
                Hủy
              </Button>
            </div>
            {pwSuccess && (
              <div className="bg-success-background text-success mt-2 rounded px-4 py-2 text-center">
                {pwSuccess}
              </div>
            )}
          </form>
        ) : (
          pwSuccess && (
            <div className="bg-success-background text-success rounded px-4 py-2 text-center">
              {pwSuccess}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
