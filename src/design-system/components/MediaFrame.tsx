import { clsx } from 'clsx';
import type { ReactNode } from 'react';

export type MediaVariant = 'default' | 'thumbnail' | 'article' | 'bookmark' | 'recommendation' | 'cover';

export function MediaFrame({ variant = 'default', empty = false, children }: { variant?: MediaVariant; empty?: boolean; children: ReactNode }) {
  return <span className={clsx('nd-media-frame')} data-variant={variant} data-empty={empty}>{children}</span>;
}
