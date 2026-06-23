import { clsx } from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

type Props = {
  active?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Chip({ active, className, type = 'button', ...props }: Props) {
  return (
    <button
      type={type}
      className={clsx(
        'inline-flex items-center gap-1 h-8 px-3 rounded-full text-sm transition-colors',
        active
          ? 'bg-primary text-white'
          : 'bg-bg-system text-caption-strong hover:bg-neutral-150',
        className,
      )}
      {...props}
    />
  );
}
