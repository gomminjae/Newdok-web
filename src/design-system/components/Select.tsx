import { clsx } from 'clsx';
import { forwardRef, type SelectHTMLAttributes } from 'react';
import { Icon } from './Icon';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, children, ...props }, ref) {
  return <span className={clsx('relative block', className)}><select ref={ref} {...props} className="nd-select">{children}</select><span className="pointer-events-none absolute top-1/2 right-4 flex -translate-y-1/2 text-caption-neutral"><Icon name="Line Down" /></span></span>;
});
