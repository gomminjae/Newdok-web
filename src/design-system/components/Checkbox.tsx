import { clsx } from 'clsx';
import type { InputHTMLAttributes } from 'react';

/** Native checkbox semantics with the app's original checked/unchecked artwork. */
export function Checkbox({ className, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  return <input {...props} type="checkbox" className={clsx(
    "h-6 w-6 shrink-0 appearance-none bg-[url('/images/app/uncheck.svg')] bg-contain bg-center bg-no-repeat checked:bg-[url('/images/app/check.svg')] disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
    className,
  )} />;
}
