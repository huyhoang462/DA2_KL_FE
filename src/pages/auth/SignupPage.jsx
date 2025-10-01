import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeClosed, Loader2 } from 'lucide-react';

import FloatingLabelInput from '../../components/ui/FloatingLabelInput';

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone) => /^0\d{9,10}$/.test(phone);

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState({});

  const nav = useNavigate();

  const handleSubmit = async (e) => {
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
    // TODO: Gọi API đăng ký ở đây
    setTimeout(() => {
      setLoading(false);
      nav('/login');
    }, 1000);
  };

  // Hàm helper để giảm lặp code trong onChange
  const handleInputChange = (setter, fieldName) => (e) => {
    setter(e.target.value);
    if (fieldError[fieldName]) {
      setFieldError((prev) => ({ ...prev, [fieldName]: undefined }));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-2">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white px-6 py-8 shadow-xl">
        <div className="mb-4 flex flex-col items-center">
          <img
            src="/favicon.ico"
            alt="Logo ShineTicket"
            className="mb-2 h-16"
          />
          <h1 className="mb-1 text-2xl font-extrabold text-gray-900">
            Đăng ký <span className="text-primary">ShineTicket</span>
          </h1>
        </div>

        {/* Giảm khoảng cách giữa các trường một chút để tối ưu hơn */}
        <form className="space-y-5" onSubmit={handleSubmit} autoComplete="off">
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
                className="hover:text-primary text-gray-400"
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
                className="hover:text-primary text-gray-400"
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

          <button
            type="submit"
            className="bg-primary focus:ring-primary flex w-full cursor-pointer items-center justify-center rounded-lg px-5 py-3 text-center text-base font-semibold text-gray-900 transition hover:bg-yellow-400 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-60"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Đăng ký
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <Link
            to="/login"
            className="text-primary cursor-pointer font-semibold hover:underline"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
