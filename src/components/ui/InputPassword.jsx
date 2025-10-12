import { Eye, EyeClosed } from 'lucide-react';
import Input from './Input';
import { useState } from 'react';

const InputPassword = ({ id, label, value, onChange, error, loading }) => {
  const [isShowPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        label={label}
        type={isShowPassword ? 'text' : 'password'}
        autoComplete="current-password"
        value={value}
        onChange={onChange}
        error={error}
        disabled={loading}
      />

      <button
        type="button"
        tabIndex={-1}
        className="hover:text-primary text-text-primary absolute top-10 right-0 pr-3"
        onClick={() => setShowPassword((v) => !v)}
        aria-label={isShowPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        disabled={loading}
      >
        {isShowPassword ? (
          <Eye className="h-5 w-5 cursor-pointer" />
        ) : (
          <EyeClosed className="h-5 w-5 cursor-pointer" />
        )}
      </button>
    </div>
  );
};
export default InputPassword;
