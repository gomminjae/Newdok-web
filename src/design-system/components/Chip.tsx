import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  active?: boolean;
  tone?: 'neutral' | 'primary' | 'inverse' | 'overlay' | 'muted';
  variant?: 'default' | 'option' | 'category' | 'filter';
  size?: 'sm' | 'md';
} & (
  | { as?: 'span' }
  | ({ as: 'button' } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'style' | 'children' | 'aria-pressed'>)
);

export function Chip({ as = 'span', active = false, tone = 'neutral', variant = 'default', size = 'sm', ...props }: Props) {
  const appearance = { className: 'nd-chip', 'data-variant': variant, 'data-size': size, 'data-tone': tone, 'data-active': active };
  return as === 'button' ? <button type="button" {...props} {...appearance} aria-pressed={active} /> : <span {...appearance}>{props.children}</span>;
}
