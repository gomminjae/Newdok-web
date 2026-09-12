import { clsx } from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  active?: boolean;
} & (
  | { as?: 'span' }
  | ({ as: 'button' } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'style' | 'children' | 'aria-pressed'>)
);

/** 카테고리 표시와 선택 필터가 공유하는 앱 기본 칩. 외형은 이곳에서만 변경한다. */
export function Chip({ as = 'span', active = false, ...props }: Props) {
  const className = clsx(
    'inline-flex shrink-0 items-center justify-center gap-1 rounded-2xl border bg-bg px-2.5 py-1.5 text-xs font-normal leading-4 whitespace-nowrap',
    active ? 'border-primary text-primary' : 'border-line-neutral text-caption-strong',
    as === 'button' && 'transition-colors hover:bg-bg-system disabled:cursor-default disabled:opacity-50',
  );

  if (as === 'button') {
    return <button type="button" {...props} aria-pressed={active} className={className} />;
  }

  return <span className={className}>{props.children}</span>;
}
