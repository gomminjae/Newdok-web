import { clsx } from 'clsx';
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

type Props = {
  label?: string;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
  error?: string;
  size?: 'default' | 'compact';
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, leftIcon, rightSlot, error, className, size = 'default', id, 'aria-describedby': describedBy, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  return (
    <div className="flex flex-col gap-1">
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
          aria-describedby={[describedBy, error ? errorId : undefined].filter(Boolean).join(' ') || undefined}
          className={clsx(
            'w-full rounded-[4px] border px-4 text-sm font-medium text-caption-heavy',
            size === 'compact' ? 'h-12' : 'h-[50px]',
            'placeholder:text-caption-assistive outline-none transition-colors',
            leftIcon && 'pl-12',
            rightSlot && 'pr-12',
            error ? 'border-error bg-error-bg' : 'border-line-alternative bg-bg focus:border-primary',
            className,
          )}
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
