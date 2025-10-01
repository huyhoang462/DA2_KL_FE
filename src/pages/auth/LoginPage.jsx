import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeClosed, Loader2, X } from 'lucide-react';
import { handleLogin } from '../../services/authService';
import { useDispatch } from 'react-redux';
import { login } from '../../store/slices/authSlice';

// Giả lập API quên mật khẩu
const forgotPasswordAPI = async (email) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        reject({ error: 'Email không hợp lệ.' });
      } else if (email !== 'hoangpk@gmail.com') {
        reject({ error: 'Email chưa được đăng ký.' });
      } else {
        resolve({
          message: 'Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư.',
        });
      }
    }, 800);
  });
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal quên mật khẩu
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');

  const nav = useNavigate();
  const dispatch = useDispatch();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    if (!validateEmail(email)) {
      setErrorMessage('Email không hợp lệ.');
      return;
    }

    setLoading(true);
    try {
      const data = await handleLogin({ email, password });
      dispatch(login(data));
      nav('/');
    } catch (err) {
      setErrorMessage(err?.error || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Ẩn lỗi khi người dùng tiếp tục nhập
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errorMessage) setErrorMessage('');
  };
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errorMessage) setErrorMessage('');
  };

  // Xử lý modal quên mật khẩu
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
      const res = await forgotPasswordAPI(forgotEmail);
      setForgotSuccess(res.message);
    } catch (err) {
      setForgotError(err?.error || 'Có lỗi xảy ra.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="relative w-full max-w-md rounded-xl bg-gray-900 p-8 shadow-lg">
        <X
          onClick={() => nav('/')}
          className="hover:text-primary absolute top-4 right-4 h-6 w-6 cursor-pointer text-gray-400"
          aria-label="Đóng"
        />
        <div className="mb-6 flex flex-col items-center">
          <img src="/favicon.ico" alt="Logo" className="mb-2 h-16" />
          <h1 className="text-2xl font-bold text-white">
            Đăng nhập vào <span className="text-primary">ShineTicket</span>
          </h1>
        </div>
        {errorMessage && (
          <div className="mb-4 rounded bg-red-100 px-4 py-2 text-center text-sm text-red-700">
            {errorMessage}
          </div>
        )}
        <form className="space-y-5" onSubmit={handleSubmit} autoComplete="off">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-200"
            >
              Email
            </label>
            <input
              id="email"
              spellCheck={false}
              autoFocus
              autoComplete="username"
              className="focus:border-primary block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-white placeholder-gray-400 focus:outline-none"
              placeholder="name@company.com"
              value={email}
              onChange={handleEmailChange}
              disabled={loading}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-200"
            >
              Mật khẩu
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="focus:border-primary block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 pr-10 text-white placeholder-gray-400 focus:outline-none"
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
                disabled={loading}
              />
              <button
                type="button"
                tabIndex={-1}
                className="hover:text-primary absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeClosed className="h-5 w-5 cursor-pointer" />
                ) : (
                  <Eye className="h-5 w-5 cursor-pointer" />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Link
              to="/signup"
              className="text-primary text-sm font-medium hover:underline"
            >
              Đăng ký tài khoản
            </Link>
            <button
              type="button"
              className="hover:text-primary cursor-pointer text-sm text-gray-300"
              disabled={loading}
              onClick={() => {
                setShowForgotModal(true);
                setForgotEmail('');
                setForgotError('');
                setForgotSuccess('');
              }}
            >
              Quên mật khẩu?
            </button>
          </div>
          <button
            type="submit"
            className="bg-primary focus:ring-primary flex w-full cursor-pointer items-center justify-center rounded-lg px-5 py-2.5 text-center text-sm font-semibold text-gray-900 transition hover:bg-yellow-400 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-60"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Đăng nhập
          </button>
        </form>

        {/* Modal Quên mật khẩu */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
              <button
                className="hover:text-primary absolute top-3 right-3 cursor-pointer text-gray-400"
                onClick={() => setShowForgotModal(false)}
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="mb-4 text-lg font-bold text-gray-800">
                Quên mật khẩu
              </h2>
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <input
                  id="reset-email"
                  spellCheck={false}
                  className="focus:border-primary block w-full rounded border border-gray-300 bg-gray-50 p-2 text-gray-900 focus:outline-none"
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
                  <div className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">
                    {forgotError}
                  </div>
                )}
                {forgotSuccess && (
                  <div className="rounded bg-green-100 px-3 py-2 text-sm text-green-700">
                    {forgotSuccess}
                  </div>
                )}
                <button
                  type={forgotSuccess ? 'button' : 'submit'}
                  className="bg-primary flex w-full cursor-pointer items-center justify-center rounded px-4 py-2 font-semibold text-gray-900 transition hover:bg-yellow-400 disabled:opacity-60"
                  disabled={forgotLoading}
                  onClick={
                    forgotSuccess ? () => setShowForgotModal(false) : undefined
                  }
                >
                  {forgotLoading && (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  )}
                  {forgotSuccess ? 'OK' : 'Xác nhận'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
