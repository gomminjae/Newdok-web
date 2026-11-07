import { clsx } from 'clsx';
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

type Props = {
  label?: string;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
  error?: string;
  size?: 'default' | 'compact';
  variant?: 'default' | 'search';
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, leftIcon, rightSlot, error, className, size = 'default', variant = 'default', id, 'aria-describedby': describedBy, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-caption-neutral">{label}</label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-4 flex items-center pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          data-size={size}
          data-variant={variant}
          data-left-icon={!!leftIcon}
          data-right-slot={!!rightSlot}
          aria-describedby={[describedBy, error ? errorId : undefined].filter(Boolean).join(' ') || undefined}
          className="nd-input"
          {...props}
        />
        {rightSlot && (
          <span className="absolute right-3 flex items-center">{rightSlot}</span>
        )}
      </div>
      {error && <p id={errorId} role="alert" className="text-xs text-error">{error}</p>}
    </div>
  );
});
