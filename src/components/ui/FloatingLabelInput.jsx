const FloatingLabelInput = ({
  id,
  label,
  value,
  error,
  endIcon,
  type = 'text',
  disabled,
  ...props
}) => {
  return (
    <div className="relative">
      <input
        id={id}
        value={value}
        type={type}
        disabled={disabled}
        // Tailwind CSS classes cho input
        className={`peer block w-full rounded-lg border bg-gray-50 p-3 text-base text-gray-900 placeholder-transparent focus:ring-0 focus:outline-none ${endIcon ? 'pr-10' : ''} ${error ? 'border-red-500 focus:border-red-500' : 'focus:border-primary border-gray-300'} `}
        placeholder={label} // Quan trọng: placeholder phải có để CSS selector hoạt động
        {...props}
      />
      <label
        htmlFor={id}
        // Tailwind CSS classes cho label (hiệu ứng nổi)
        className={`absolute top-0 left-3 -translate-y-1/2 scale-75 cursor-text bg-white px-1 text-sm transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-gray-400 peer-focus:top-0 peer-focus:scale-75 ${error ? 'text-red-500 peer-focus:text-red-500' : 'peer-focus:text-primary text-gray-500'} `}
      >
        {label}
      </label>
      {endIcon && (
        <div className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3">
          {endIcon}
        </div>
      )}
      {error && <div className="mt-1 pl-1 text-xs text-red-500">{error}</div>}
    </div>
  );
};

export default FloatingLabelInput;
