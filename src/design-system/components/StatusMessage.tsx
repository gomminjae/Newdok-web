import { clsx } from 'clsx';
import type { ReactNode } from 'react';

/** Informational results. Pending work uses LoadingState; successful actions use Toast. */
export function StatusMessage({ children, className }: { children: ReactNode; className?: string }) {
  return <p role="status" aria-live="polite" className={clsx('nd-status-message', className)}>{children}</p>;
}
