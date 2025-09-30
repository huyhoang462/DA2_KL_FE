import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeClosed, Loader2, X } from 'lucide-react';
import { handleLogin } from '../../services/authService';
import { useDispatch } from 'react-redux';
import { login } from '../../store/slices/authSlice';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

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
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
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
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
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
              // onClick={...} // TODO: Thêm modal quên mật khẩu sau
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
      </div>
    </div>
  );
}
