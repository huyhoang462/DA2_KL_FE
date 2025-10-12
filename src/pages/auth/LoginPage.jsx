import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { handleLogin } from '../../services/authService';
import { useDispatch } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { validateEmail } from '../../utils/validation';
import InputPassword from '../../components/ui/InputPassword';
import ForgotPasswordModal from '../../components/features/auth/FogotPasswordModal';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState({});
  const [loading, setLoading] = useState(false);

  const [showForgotModal, setShowForgotModal] = useState(false);

  const nav = useNavigate();
  const dispatch = useDispatch();

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
            <InputPassword
              id="loginPassword"
              label="Mật khẩu"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage.password)
                  setErrorMessage((pre) => ({ ...pre, password: undefined }));
                if (errorMessage.error)
                  setErrorMessage((pre) => ({ ...pre, error: undefined }));
              }}
              error={errorMessage?.password}
              loading={loading}
            />
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
              onClick={() => setShowForgotModal(true)}
            >
              Quên mật khẩu?
            </button>
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Đăng nhập
          </Button>
        </form>
      </div>
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </div>
  );
}
