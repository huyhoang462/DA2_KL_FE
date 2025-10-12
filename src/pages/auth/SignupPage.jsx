import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeClosed, Loader2, X } from 'lucide-react';

import FloatingLabelInput from '../../components/ui/FloatingLabelInput';
import {
  handleRegisterRequest,
  handleVerifyEmail,
} from '../../services/authService';

import { validateEmail, validatePhone } from '../../utils/validation';
export default function SignupPage() {
  const [formStep, setFormStep] = useState('register');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState({});
  const [serverError, setServerError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const nav = useNavigate();

  const handleInputChange = (setter, fieldName) => (e) => {
    setter(e.target.value);
    if (fieldError[fieldName]) {
      setFieldError((prev) => ({ ...prev, [fieldName]: undefined }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    let errors = {};

    if (!email) errors.email = 'Vui lòng nhập email.';
    else if (!validateEmail(email)) errors.email = 'Email không hợp lệ.';

    if (!fullName) errors.fullName = 'Vui lòng nhập họ tên.';

    if (!phone) errors.phone = 'Vui lòng nhập số điện thoại.';
    else if (!validatePhone(phone))
      errors.phone = 'Số điện thoại không hợp lệ.';

    if (!password) errors.password = 'Vui lòng nhập mật khẩu.';
    else if (password.length < 6)
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';

    if (!confirmPassword)
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu.';
    else if (password !== confirmPassword)
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp.';

    setFieldError(errors);

    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    setServerError('');

    const formData = {
      email,
      password,
      name: fullName,
      phone,
      role: 'user',
    };

    try {
      await handleRegisterRequest({ formData });
      setFormStep('verify');
    } catch (error) {
      if (error.status >= 400 && error.status < 500) {
        setServerError(error.message);
      } else {
        setServerError('Lỗi hệ thống, vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setFieldError({});
    if (!otp || otp.trim().length !== 6) {
      setFieldError({ otp: 'Vui lòng nhập mã OTP gồm 6 chữ số.' });
      return;
    }

    setLoading(true);
    setServerError('');

    try {
      await handleVerifyEmail({ email, otp });
      setShowSuccessModal(true);
    } catch (error) {
      if (error.status >= 400 && error.status < 500) {
        setServerError(error.message);
      } else {
        setServerError('Lỗi hệ thống, vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (formStep === 'verify') {
    return (
      <div className="bg-background-primary flex min-h-screen items-center justify-center px-2">
        <div className="bg-foreground mx-auto w-full max-w-md rounded-2xl px-6 py-8 shadow-xl">
          <div className="mb-4 flex flex-col items-center">
            <img
              src="/favicon.ico"
              alt="Logo ShineTicket"
              className="mb-2 h-16"
            />
            <h1 className="text-text-primary mb-2 text-2xl font-extrabold">
              Xác thực Email
            </h1>
            <p className="text-text-secondary text-center text-sm">
              Một mã xác thực đã được gửi đến{' '}
              <strong className="text-text-primary">{email}</strong>. Vui lòng
              kiểm tra và nhập mã vào bên dưới.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleVerifySubmit}>
            <FloatingLabelInput
              id="otp"
              label="Mã OTP"
              type="text"
              value={otp}
              onChange={handleInputChange(setOtp, 'otp')}
              error={fieldError.otp}
              disabled={loading}
              autoComplete="one-time-code"
            />

            {serverError && (
              <p className="text-center text-sm text-red-500">{serverError}</p>
            )}

            <button
              type="submit"
              className="bg-primary focus:ring-primary text-primary-foreground hover:bg-primary-hover flex w-full cursor-pointer items-center justify-center rounded-lg px-5 py-3 text-center text-base font-semibold transition focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-60"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Xác nhận
            </button>
          </form>

          <div className="text-text-secondary mt-4 text-center text-sm">
            Không nhận được mã?{' '}
            <button
              onClick={() => {
                /* TODO: Thêm logic gửi lại mã OTP */
              }}
              className="text-link cursor-pointer font-semibold hover:underline"
              disabled={loading}
            >
              Gửi lại
            </button>
          </div>
        </div>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-background-secondary relative w-full max-w-sm rounded-lg p-6 shadow-xl">
              <button
                className="hover:text-primary text-text-primary absolute top-3 right-3 cursor-pointer"
                onClick={() => {
                  setShowSuccessModal(false);
                  nav('/login');
                }}
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-text-primary mb-4 text-lg font-bold">
                Xác thực thành công!
              </h2>
              <p className="text-text-secondary mb-6 text-sm">
                Tài khoản của bạn đã được xác thực thành công. Bạn có thể đăng
                nhập ngay bây giờ.
              </p>
              <button
                className="bg-primary text-primary-foreground hover:bg-primary-hover w-full cursor-pointer rounded-lg px-5 py-3 font-semibold"
                onClick={() => nav('/login')}
              >
                Đến trang đăng nhập
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-background-primary flex min-h-screen items-center justify-center px-2">
      <div className="bg-foreground mx-auto w-full max-w-md rounded-2xl px-6 py-8 shadow-xl">
        <div className="mb-4 flex flex-col items-center">
          <img
            src="/favicon.ico"
            alt="Logo ShineTicket"
            className="mb-2 h-16"
          />
          <h1 className="text-text-primary mb-1 text-2xl font-extrabold">
            Đăng ký <span className="text-primary">ShineTicket</span>
          </h1>
        </div>

        <form
          className="space-y-4"
          onSubmit={handleRegisterSubmit}
          autoComplete="off"
        >
          <FloatingLabelInput
            id="email"
            label="Email"
            type="text"
            value={email}
            onChange={handleInputChange(setEmail, 'email')}
            error={fieldError.email}
            disabled={loading}
            autoComplete="username"
            spellCheck={false}
          />
          <FloatingLabelInput
            id="fullName"
            label="Họ tên"
            type="text"
            value={fullName}
            onChange={handleInputChange(setFullName, 'fullName')}
            error={fieldError.fullName}
            disabled={loading}
            spellCheck={false}
          />
          <FloatingLabelInput
            id="phone"
            label="Số điện thoại"
            type="tel"
            value={phone}
            onChange={handleInputChange(setPhone, 'phone')}
            error={fieldError.phone}
            disabled={loading}
          />
          <FloatingLabelInput
            id="password"
            label="Mật khẩu"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={handleInputChange(setPassword, 'password')}
            error={fieldError.password}
            disabled={loading}
            autoComplete="new-password"
            endIcon={
              <button
                type="button"
                tabIndex={-1}
                className="hover:text-primary text-text-secondary cursor-pointer"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeClosed className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            }
          />
          <FloatingLabelInput
            id="confirmPassword"
            label="Xác nhận mật khẩu"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={handleInputChange(setConfirmPassword, 'confirmPassword')}
            error={fieldError.confirmPassword}
            disabled={loading}
            autoComplete="new-password"
            endIcon={
              <button
                type="button"
                tabIndex={-1}
                className="hover:text-primary text-text-secondary cursor-pointer"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={
                  showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'
                }
                disabled={loading}
              >
                {showConfirmPassword ? (
                  <EyeClosed className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            }
          />

          {serverError && (
            <p className="text-center text-sm text-red-500">{serverError}</p>
          )}

          <button
            type="submit"
            className="bg-primary focus:ring-primary text-primary-foreground hover:bg-primary-hover flex w-full cursor-pointer items-center justify-center rounded-lg px-5 py-3 text-center text-base font-semibold transition focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-60"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Đăng ký
          </button>
        </form>

        <div className="text-text-secondary mt-4 text-center text-sm">
          Đã có tài khoản?{' '}
          <Link
            to="/login"
            className="text-link cursor-pointer font-semibold hover:underline"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
