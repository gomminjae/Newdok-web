import { clsx } from 'clsx';
import type { ReactNode } from 'react';

type Variant = 'default' | 'primary';

type Props = {
  variant?: Variant;
  children: ReactNode;
  className?: string;
};

const VARIANT_CLASS: Record<Variant, string> = {
  default: 'bg-bg-system text-caption-strong',
  primary: 'bg-tint-50 text-primary',
};

export function Tag({ variant = 'default', children, className }: Props) {
  return (
    <span
      className={clsx(
        'inline-flex items-center h-6 px-2 rounded text-xs font-medium',
        VARIANT_CLASS[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
