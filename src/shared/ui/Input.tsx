import { clsx } from 'clsx';
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

type Props = {
  label?: string;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, leftIcon, rightSlot, error, className, ...props },
  ref,
) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-caption-strong">{label}</label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-4 flex items-center pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full h-12 rounded-lg border bg-bg px-4 text-base text-caption-heavy',
            'placeholder:text-caption-assistive outline-none transition-colors',
            'focus:border-primary',
            leftIcon && 'pl-12',
            rightSlot && 'pr-12',
            error ? 'border-error' : 'border-line-disabled',
            className,
          )}
          {...props}
        />
        {rightSlot && (
          <span className="absolute right-3 flex items-center">{rightSlot}</span>
        )}
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
});
