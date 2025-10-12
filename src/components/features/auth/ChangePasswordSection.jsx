import React, { useState } from 'react';
import { validatePassword } from '../../../utils/validation';
import { handleChangePassword } from '../../../services/authService';
import { Pencil, Save } from 'lucide-react';
import InputPassword from '../../ui/InputPassword';
import Button from '../../ui/Button';
import { useSelector } from 'react-redux';

const ChangePasswordSection = () => {
  const userId = useSelector((state) => state.auth.user?.id);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState({});
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');

  const resetForm = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPwError({});
  };

  const onChangePassword = async (e) => {
    e.preventDefault();
    let errors = {};
    if (!oldPassword) errors.oldPassword = 'Nhập mật khẩu hiện tại.';
    if (!newPassword) errors.newPassword = 'Nhập mật khẩu mới.';
    else if (validatePassword(newPassword) === false)
      errors.newPassword =
        'Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.';
    else if (newPassword === oldPassword)
      errors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại.';
    if (!confirmPassword) errors.confirmPassword = 'Nhập lại mật khẩu mới.';
    else if (newPassword !== confirmPassword)
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    setPwError(errors);
    if (Object.keys(errors).length > 0) return;

    setPwLoading(true);
    setPwSuccess('');
    setPwError({});
    try {
      const res = await handleChangePassword({
        userId,
        oldPassword,
        newPassword,
      });
      setShowChangePassword(false);
      resetForm();
      setPwSuccess(res?.message || 'Đổi mật khẩu thành công!');
    } catch (error) {
      setPwError({ api: error.message });
    } finally {
      setPwLoading(false);
    }
  };
  return (
    <div className="bg-background-secondary rounded-2xl p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-primary h-8 text-xl font-bold">Đổi mật khẩu</h2>
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
          <InputPassword
            id="changeOldPassword"
            label="Mật khẩu hiện tại"
            value={oldPassword}
            onChange={(e) => {
              setOldPassword(e.target.value);
              if (pwError.oldPassword) {
                setPwError((prev) => ({ ...prev, oldPassword: undefined }));
              }
            }}
            error={pwError.oldPassword}
            loading={pwLoading}
          />
          <InputPassword
            id="changeNewPassword"
            label="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (pwError.newPassword) {
                setPwError((prev) => ({ ...prev, newPassword: undefined }));
              }
            }}
            error={pwError.newPassword}
            loading={pwLoading}
          />
          <InputPassword
            id="changeConfirmPassword"
            label="Xác nhận mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (pwError.confirmPassword) {
                setPwError((prev) => ({ ...prev, confirmPassword: undefined }));
              }
            }}
            error={pwError.confirmPassword}
            loading={pwLoading}
          />

          <div className="flex justify-end gap-2">
            <Button
              type="submit"
              loading={pwLoading}
              className="flex items-center gap-1"
              disabled={pwLoading}
            >
              <Save className="h-4 w-4" />
              Lưu
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-1"
              disabled={pwLoading}
              onClick={() => {
                setShowChangePassword(false);
                resetForm();
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
          {pwError.api && (
            <p className="bg-destructive-background text-destructive mt-2 rounded px-4 py-2 text-center">
              {pwError.api}
            </p>
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
  );
};

export default React.memo(ChangePasswordSection);
