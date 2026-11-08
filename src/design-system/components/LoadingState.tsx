import { clsx } from 'clsx';

export function LoadingState({ label = '불러오는 중이에요.', layout = 'section', className }: { label?: string; layout?: 'inline' | 'section' | 'page'; className?: string }) {
  return <div role="status" aria-live="polite" aria-busy="true" data-layout={layout} className={clsx('nd-loading', className)}><span aria-hidden="true" className="nd-loading-spinner" /><span>{label}</span></div>;
}
