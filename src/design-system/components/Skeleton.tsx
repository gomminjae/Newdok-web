import { clsx } from 'clsx';

/** Decorative placeholder. The enclosing loading region supplies the accessible label. */
export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden="true" className={clsx('nd-skeleton', className)} />;
}
