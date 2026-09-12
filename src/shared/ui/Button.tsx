import { clsx } from 'clsx';
import Link from 'next/link';
import type { ButtonHTMLAttributes, ComponentProps } from 'react';

type Variant = 'primary' | 'outline' | 'neutral-outline' | 'secondary' | 'ghost' | 'ghost-neutral' | 'danger' | 'kakao' | 'apple';
type Size = 'xs' | 'sm' | 'utility' | 'short' | 'compact' | 'md' | 'lg';
type Radius = 'sm' | 'md' | 'lg' | 'xl';

type ButtonStyleProps = {
  variant?: Variant;
  size?: Size;
  radius?: Radius;
  fullWidth?: boolean;
  disabledTone?: 'muted' | 'white' | 'preserve';
  className?: string;
};
type Props = ButtonStyleProps & ButtonHTMLAttributes<HTMLButtonElement>;

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-strong active:bg-primary-heavy',
  outline: 'border border-primary bg-bg text-primary hover:bg-primary-hover active:bg-primary-press',
  'neutral-outline': 'border border-line-neutral bg-bg text-caption-neutral hover:bg-bg-system',
  secondary: 'bg-bg-system text-caption-heavy hover:bg-neutral-150',
  ghost: 'bg-transparent text-primary hover:bg-primary-hover',
  'ghost-neutral': 'bg-transparent text-caption-neutral hover:bg-bg-system',
  danger: 'bg-error text-white',
  kakao: 'bg-[#FEE500] text-black/85 hover:bg-[#FADA0A] active:bg-[#FADA0A]',
  apple: 'bg-black text-white hover:bg-neutral-900 active:bg-neutral-800',
};

const SIZE_CLASS: Record<Size, string> = {
  xs: 'min-h-8 text-[13px]',
  sm: 'min-h-9 text-xs',
  utility: 'min-h-9 text-sm',
  short: 'min-h-10 text-sm',
  compact: 'min-h-11 text-sm',
  md: 'min-h-12 text-sm',
  lg: 'min-h-14 text-base',
};

const RADIUS_CLASS: Record<Radius, string> = {
  sm: 'rounded-[4px]', md: 'rounded-[8px]', lg: 'rounded-[12px]', xl: 'rounded-[16px]',
};

function buttonClasses({ variant = 'primary', size = 'md', radius = 'sm', fullWidth, disabledTone = 'muted', className }: ButtonStyleProps) {
  const isGhost = variant === 'ghost' || variant === 'ghost-neutral';
  return clsx(
    'inline-flex shrink-0 items-center justify-center transition-colors duration-200',
    isGhost ? 'gap-1 font-medium' : size === 'utility' ? 'gap-1 px-5 font-medium'
      : clsx('gap-2', size === 'xs' ? 'font-medium' : 'font-bold', size === 'xs' || size === 'sm' ? 'px-3' : size === 'lg' ? 'px-5' : 'px-4'),
    'disabled:cursor-default',
    disabledTone === 'preserve' ? 'disabled:opacity-100' : variant === 'kakao' || variant === 'apple' || isGhost ? 'disabled:opacity-50'
      : clsx('disabled:border-transparent disabled:bg-neutral-150', disabledTone === 'white' ? 'disabled:text-white' : 'disabled:text-caption-disabled'),
    VARIANT_CLASS[variant], SIZE_CLASS[size], RADIUS_CLASS[radius], fullWidth && 'w-full', className,
  );
}

export function Button({ variant, size, radius, fullWidth, disabledTone, className, type = 'button', ...props }: Props) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, radius, fullWidth, disabledTone, className })}
      {...props}
    />
  );
}

export function ButtonLink({ variant, size, radius, fullWidth, disabledTone, className, ...props }: ButtonStyleProps & Omit<ComponentProps<typeof Link>, 'className'>) {
  return <Link className={buttonClasses({ variant, size, radius, fullWidth, disabledTone, className })} {...props} />;
}
