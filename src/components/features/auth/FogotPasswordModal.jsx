import { useState } from 'react';
import Button from '../../ui/Button';
import InputPassword from '../../ui/InputPassword';
import Modal from '../../ui/Modal';
import { toast } from 'react-toastify';
import Input from '../../ui/Input';
import { validateEmail, validatePassword } from '../../../utils/validation';
import {
  forgotPasswordAPI,
  resetPasswordAPI,
  verifyResetCodeAPI,
} from '../../../services/authService';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [forgotStep, setForgotStep] = useState('request');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    if (!forgotEmail) {
      setForgotError('Vui lòng nhập email.');
      return;
    }
    if (!validateEmail(forgotEmail)) {
      setForgotError('Email không hợp lệ.');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await forgotPasswordAPI({ email: forgotEmail });
      setForgotSuccess(res.message);
      setForgotStep('verify');
    } catch (err) {
      setForgotError(err?.message || 'Có lỗi xảy ra.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    if (!resetCode || resetCode.length !== 6) {
      setForgotError('Vui lòng nhập mã xác thực gồm 6 số.');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await verifyResetCodeAPI({
        email: forgotEmail,
        code: resetCode,
      });
      setForgotSuccess(res.message);
      setForgotStep('reset');
    } catch (err) {
      setForgotError(err?.message || 'Có lỗi xảy ra.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    if (!newPassword) {
      setForgotError('Vui lòng nhập mật khẩu mới.');
      return;
    } else if (validatePassword(newPassword) === false) {
      setForgotError(
        'Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.'
      );
      return;
    }
    setForgotLoading(true);
    try {
      const res = await resetPasswordAPI({
        email: forgotEmail,
        code: resetCode,
        newPassword,
      });
      setForgotSuccess(res.message);
      // setShowForgotModal(false);
      setForgotStep('request');
      setForgotEmail('');
      setResetCode('');
      setNewPassword('');
      setForgotError('');
      setForgotSuccess('');
      toast.success('Đặt lại mật khẩu thành công!');
    } catch (err) {
      setForgotError(err?.message || 'Có lỗi xảy ra.');
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotModal = () => {
    setForgotStep('request');
    setForgotEmail('');
    setResetCode('');
    setNewPassword('');
    setForgotError('');
    setForgotSuccess('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={closeForgotModal} title="Quên mật khẩu">
      <>
        {forgotStep === 'request' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <Input
              id="reset-email"
              spellCheck={false}
              placeholder="Nhập email của bạn"
              value={forgotEmail}
              onChange={(e) => {
                setForgotEmail(e.target.value);
                setForgotError('');
                setForgotSuccess('');
              }}
              disabled={forgotLoading}
            />
            {forgotError && (
              <div className="bg-destructive-background text-destructive rounded px-3 py-2 text-sm">
                {forgotError}
              </div>
            )}
            {forgotSuccess && (
              <div className="bg-success-background text-success rounded px-3 py-2 text-sm">
                {forgotSuccess}
              </div>
            )}
            <Button
              type="submit"
              disabled={forgotLoading}
              className="w-full"
              loading={forgotLoading}
            >
              Gửi mã xác thực
            </Button>
          </form>
        )}
        {forgotStep === 'verify' && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <Input
              id="reset-code"
              placeholder="Nhập mã xác thực (6 số)"
              value={resetCode}
              onChange={(e) => {
                setResetCode(e.target.value);
                setForgotError('');
                setForgotSuccess('');
              }}
              disabled={forgotLoading}
            />
            {forgotError && (
              <div className="bg-destructive-background text-destructive rounded px-3 py-2 text-sm">
                {forgotError}
              </div>
            )}
            {forgotSuccess && (
              <div className="bg-success-background text-success rounded px-3 py-2 text-sm">
                {forgotSuccess}
              </div>
            )}
            <Button
              type="submit"
              disabled={forgotLoading}
              className="w-full"
              loading={forgotLoading}
            >
              Xác nhận mã
            </Button>
          </form>
        )}
        {forgotStep === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <InputPassword
              id="newPassword"
              label="Mật khẩu mới"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setForgotError('');
                setForgotSuccess('');
              }}
              loading={forgotLoading}
            />
            {forgotError && (
              <div className="bg-destructive-background text-destructive rounded px-3 py-2 text-sm">
                {forgotError}
              </div>
            )}
            {forgotSuccess && (
              <div className="bg-success-background text-success rounded px-3 py-2 text-sm">
                {forgotSuccess}
              </div>
            )}
            <Button
              type="submit"
              disabled={forgotLoading || forgotSuccess}
              className="w-full"
              loading={forgotLoading}
            >
              Đặt lại mật khẩu
            </Button>
          </form>
        )}
      </>
    </Modal>
  );
};
export default ForgotPasswordModal;
