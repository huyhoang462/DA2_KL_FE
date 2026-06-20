import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Pencil, Save, Wallet, Copy, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import { usePrivy } from '@privy-io/react-auth';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { validatePhone } from '../../../utils/validation';
import { handleEditProfile } from '../../../services/authService';
import { setUser } from '../../../store/slices/authSlice';

const ProfileSection = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const { user: privyUser } = usePrivy();
  const walletAddress = privyUser?.wallet?.address || user?.walletAddress;
  const [copied, setCopied] = useState(false);

  const handleCopyWallet = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Đã sao chép địa chỉ ví');
    }
  };

  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [infoError, setInfoError] = useState({});
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoSuccess, setInfoSuccess] = useState('');

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

    try {
      const res = await handleEditProfile({
        userId: user.id,
        fullName,
        phone,
      });
      setInfoSuccess(res?.message || 'Cập nhật thông tin thành công!');
      setEditMode(false);
      dispatch(setUser(res.user));
    } catch (error) {
      setInfoError({ api: error.message });
    } finally {
      setInfoLoading(false);
    }
  };
  return (
    <div className="bg-background-secondary mb-8 rounded-2xl p-6 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-primary h-8 text-xl font-bold">
          Thông tin tài khoản
        </h2>
        {!editMode && (
          <button
            className="text-primary hover:bg-primary/10 flex cursor-pointer items-center gap-x-1 rounded border-none px-3 py-1.5 text-sm font-medium transition"
            onClick={() => {
              setEditMode(true);
              setInfoSuccess('');
            }}
          >
            <Pencil className="h-4 w-4" />
            Chỉnh sửa
          </button>
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
        
        <div className="bg-background-primary border-border-default flex items-center justify-between rounded-xl border px-3 py-3 text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <Wallet className="text-text-secondary h-4 w-4" />
              <span className="text-text-secondary font-medium whitespace-nowrap">Ví Privy:</span>
            </div>
            <span className="text-text-primary font-mono font-medium break-all">
              {walletAddress || 'Chưa kết nối ví'}
            </span>
          </div>
          {walletAddress && (
            <button
              type="button"
              onClick={handleCopyWallet}
              className="text-text-secondary hover:text-primary transition-colors focus:outline-none p-1 ml-2"
              title="Sao chép địa chỉ ví"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </button>
          )}
        </div>

        <Input
          id="fullName"
          label="Họ tên"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (infoError.fullName)
              setInfoError((pre) => ({ ...pre, fullName: undefined }));
          }}
          disabled={!editMode || infoLoading}
          error={infoError.fullName}
        />
        <Input
          id="phone"
          label="Số điện thoại"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (infoError.phone)
              setInfoError((pre) => ({ ...pre, phone: undefined }));
          }}
          disabled={!editMode || infoLoading}
          error={infoError.phone}
        />
        {editMode && (
          <div className="flex items-center justify-end gap-x-2">
            <Button
              type="submit"
              size="sm"
              className="flex items-center gap-1"
              loading={infoLoading}
            >
              <Save className="h-4 w-4" />
              Lưu
            </Button>

            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="flex items-center"
              onClick={() => {
                setEditMode(false);
                setInfoSuccess('');
                setFullName(user?.fullName || '');
                setPhone(user?.phone || '');
                setInfoError({});
              }}
            >
              Hủy
            </Button>
          </div>
        )}
      </form>
      {infoSuccess && (
        <div className="bg-success-background text-success mt-4 rounded px-4 py-2">
          {infoSuccess}
        </div>
      )}
    </div>
  );
};

export default React.memo(ProfileSection);
