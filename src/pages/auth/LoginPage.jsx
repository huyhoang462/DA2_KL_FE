import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeClosed, X } from 'lucide-react';
import { handleLogin } from '../../services/authService';
import { useDispatch } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import {
  forgotPasswordAPI,
  verifyResetCodeAPI,
  resetPasswordAPI,
} from '../../services/authService';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState({});
  const [loading, setLoading] = useState(false);

  // Forgot password states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState('request'); // request | verify | reset
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const nav = useNavigate();
  const dispatch = useDispatch();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Đăng nhập
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage({});
    const newErrorMessage = {};

    if (!email) {
      newErrorMessage.email = 'Bạn chưa nhập email!';
    } else if (!validateEmail(email)) {
      newErrorMessage.email = 'Email không hợp lệ!';
    }
    if (!password) {
      newErrorMessage.password = 'Bạn chưa nhập mật khẩu!';
    }
    if (Object.keys(newErrorMessage).length > 0) {
      setErrorMessage(newErrorMessage);
      return;
    }

    setLoading(true);
    try {
      const data = await handleLogin({ email, password });
      dispatch(login(data));
      nav('/');
    } catch (err) {
      if (err?.status >= 400 && err?.status < 500) {
        setErrorMessage({
          error: err.message || 'Email hoặc mật khẩu không đúng!',
        });
      } else if (err?.status >= 500) {
        setErrorMessage({ error: 'Lỗi hệ thống, vui lòng thử lại sau.' });
      } else {
        setErrorMessage({ error: 'Đã có lỗi xảy ra.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Quên mật khẩu - Bước 1: Gửi email
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

  // Quên mật khẩu - Bước 2: Xác thực mã
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

  // Quên mật khẩu - Bước 3: Đặt lại mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    if (!newPassword || newPassword.length < 6) {
      setForgotError('Mật khẩu mới phải có ít nhất 6 ký tự.');
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
      setShowForgotModal(false);
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

  // Reset modal state khi đóng
  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotStep('request');
    setForgotEmail('');
    setResetCode('');
    setNewPassword('');
    setForgotError('');
    setForgotSuccess('');
  };

  return (
    <div className="bg-background-primary flex min-h-screen items-center justify-center px-4">
      <div className="bg-foreground relative w-full max-w-md rounded-xl p-8 shadow-lg">
        <X
          onClick={() => nav('/')}
          className="hover:text-primary text-text-primary absolute top-4 right-4 h-6 w-6 cursor-pointer"
          aria-label="Đóng"
        />
        <div className="mb-6 flex flex-col items-center">
          <img src="/favicon.ico" alt="Logo" className="mb-2 h-16" />
          <h1 className="text-text-primary text-2xl font-bold">
            Đăng nhập vào <span className="text-primary">ShineTicket</span>
          </h1>
        </div>
        {errorMessage?.error && (
          <div className="text-destructive bg-destructive-background mb-4 rounded px-4 py-2 text-center text-sm">
            {errorMessage?.error}
          </div>
        )}
        <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
          <div>
            <Input
              id="email"
              label="Email"
              spellCheck={false}
              autoFocus
              autoComplete="username"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage.email)
                  setErrorMessage((pre) => ({ ...pre, email: undefined }));
                if (errorMessage.error)
                  setErrorMessage((pre) => ({ ...pre, error: undefined }));
              }}
              disabled={loading}
              error={errorMessage?.email}
            />
          </div>
          <div>
            <div className="relative">
              <Input
                id="password"
                label="Mật khẩu"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage.password)
                    setErrorMessage((pre) => ({ ...pre, password: undefined }));
                  if (errorMessage.error)
                    setErrorMessage((pre) => ({ ...pre, error: undefined }));
                }}
                error={errorMessage?.password}
                disabled={loading}
              />

              <button
                type="button"
                tabIndex={-1}
                className="hover:text-primary text-text-primary absolute top-10 right-0 pr-3"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                disabled={loading}
              >
                {showPassword ? (
                  <Eye className="h-5 w-5 cursor-pointer" />
                ) : (
                  <EyeClosed className="h-5 w-5 cursor-pointer" />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Link
              to="/signup"
              className="text-primary text-sm font-medium hover:underline"
            >
              Đăng ký
            </Link>
            <button
              type="button"
              className="hover:text-primary text-text-primary cursor-pointer text-sm"
              disabled={loading}
              onClick={() => closeForgotModal() || setShowForgotModal(true)}
            >
              Quên mật khẩu?
            </button>
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Đăng nhập
          </Button>
        </form>

        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-background-secondary relative w-full max-w-sm rounded-lg p-6 shadow-xl">
              <button
                className="hover:text-primary text-text-primary absolute top-3 right-3 cursor-pointer"
                onClick={closeForgotModal}
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-text-primary mb-4 text-lg font-bold">
                Quên mật khẩu
              </h2>
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
                  <div className="relative">
                    <Input
                      id="new-password"
                      placeholder="Nhập mật khẩu mới"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setForgotError('');
                        setForgotSuccess('');
                      }}
                      disabled={forgotLoading}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="hover:text-primary text-text-primary absolute top-3 right-3"
                      onClick={() => setShowNewPassword((v) => !v)}
                      aria-label={
                        showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'
                      }
                      disabled={forgotLoading}
                    >
                      {showNewPassword ? (
                        <EyeClosed className="h-5 w-5 cursor-pointer" />
                      ) : (
                        <Eye className="h-5 w-5 cursor-pointer" />
                      )}
                    </button>
                  </div>
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
