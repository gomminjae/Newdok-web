import Link from 'next/link';
import { clsx } from 'clsx';
import type { ComponentProps } from 'react';

/** The foreground border stays visible over full-bleed images and never catches input. */
export function CardLink({ radius = 'lg', tone = 'default', className, ...props }: ComponentProps<typeof Link> & { radius?: 'md' | 'lg'; tone?: 'default' | 'read' }) {
  return <Link {...props} data-radius={radius} data-tone={tone} className={clsx('nd-card-link', className)} />;
}
