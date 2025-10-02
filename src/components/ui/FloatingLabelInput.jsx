import clsx from 'clsx';

const FloatingLabelInput = ({
  id,
  label,
  value,
  error,
  endIcon,
  onEndIconClick,
  type = 'text',
  disabled,
  ...props
}) => {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div>
      <div className="relative">
        <input
          id={id}
          value={value}
          type={type}
          disabled={disabled}
          placeholder={label}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={clsx(
            'peer block w-full rounded-lg border p-3 text-base placeholder-transparent focus:ring-0 focus:outline-none',
            'bg-background-secondary text-text-primary',
            'disabled:bg-disabled-background disabled:text-disabled-text disabled:cursor-not-allowed',
            endIcon ? 'pr-10' : '',
            {
              'border-destructive focus:border-destructive': error,
              'border-border-default focus:border-primary': !error,
              'disabled:border-border-default': disabled,
            }
          )}
          {...props}
        />
        <label
          htmlFor={id}
          className={clsx(
            'absolute top-0 left-2 -translate-y-1/2 scale-75 cursor-text rounded-sm px-1 text-sm transition-all',
            'peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100',
            'peer-focus:top-0 peer-focus:scale-75',
            'bg-background-secondary',
            {
              'text-destructive peer-focus:text-destructive': error,
              'text-text-secondary peer-focus:text-primary': !error,
              'text-disabled-text': disabled,
            }
          )}
        >
          {label}
        </label>
        {endIcon && (
          <div
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={!disabled ? onEndIconClick : undefined}
            style={{
              cursor: onEndIconClick && !disabled ? 'pointer' : 'default',
            }}
          >
            {endIcon}
          </div>
        )}
      </div>
      <div className="pt-1.5 pl-1">
        {' '}
        {error && (
          <p id={errorId} className="text-destructive text-xs">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default FloatingLabelInput;
