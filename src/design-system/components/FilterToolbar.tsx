import { clsx } from 'clsx';
import type { ReactNode } from 'react';

/** Wrap whole controls instead of clipping or resizing shared chips on narrow screens. */
export function FilterToolbar({ label, children, actions, className }: {
  label: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return <div role="group" aria-label={label} className={clsx('nd-filter-toolbar', className)}>
    {children}
    {actions && <div className="nd-filter-toolbar-actions">{actions}</div>}
  </div>;
}
