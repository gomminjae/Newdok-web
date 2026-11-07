import { clsx } from 'clsx';
import Link from 'next/link';
import type { ButtonHTMLAttributes, ComponentProps } from 'react';

type Variant = 'primary' | 'outline' | 'neutral-outline' | 'secondary' | 'ghost' | 'ghost-neutral' | 'danger' | 'menu' | 'field' | 'choice' | 'kakao' | 'apple';
type Size = 'icon' | 'icon-chip' | 'icon-control' | 'xs' | 'sm' | 'utility' | 'short' | 'compact' | 'md' | 'lg';
type Radius = 'sm' | 'md' | 'lg' | 'xl' | 'full';
type StyleProps = {
  variant?: Variant;
  size?: Size;
  radius?: Radius;
  fullWidth?: boolean;
  disabledTone?: 'muted' | 'white' | 'preserve';
  /** Layout only. Appearance belongs to the design system. */
  className?: string;
};

function appearance({ variant = 'primary', size = 'md', radius = 'sm', fullWidth, disabledTone = 'muted', className }: StyleProps) {
  return { className: clsx('nd-button', fullWidth && 'w-full', className), 'data-variant': variant, 'data-size': size, 'data-radius': radius, 'data-disabled-tone': disabledTone };
}

export function Button({ variant, size, radius, fullWidth, disabledTone, className, type = 'button', ...props }: StyleProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...appearance({ variant, size, radius, fullWidth, disabledTone, className })} type={type} {...props} />;
}

export function ButtonLink({ variant, size, radius, fullWidth, disabledTone, className, ...props }: StyleProps & Omit<ComponentProps<typeof Link>, 'className'>) {
  return <Link {...appearance({ variant, size, radius, fullWidth, disabledTone, className })} {...props} />;
}
