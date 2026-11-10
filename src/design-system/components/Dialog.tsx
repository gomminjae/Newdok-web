'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';

export function Dialog({ title, children, onClose, onBack, busy = false, presentation = 'dialog', variant = 'default' }: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  onBack?: () => void;
  busy?: boolean;
  presentation?: 'dialog' | 'page';
  variant?: 'default' | 'notice';
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);
  return <dialog ref={ref} aria-labelledby={titleId} aria-busy={busy} data-variant={variant}
    onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}
    onClick={(event) => {
      if (busy || event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
    }}
    className={`nd-dialog fixed overflow-y-auto text-caption-strong ${variant === 'notice' ? 'font-sans' : ''} ${presentation === 'page' ? 'bg-bg-system' : 'bg-bg'} ${presentation === 'page'
      ? 'inset-0 m-0 h-dvh max-h-none w-full max-w-none px-5 pb-[calc(24px+env(safe-area-inset-bottom))] backdrop:bg-transparent md:inset-auto md:top-[var(--header-height)] md:bottom-0 md:left-[var(--sidebar-width)] md:m-0 md:h-[calc(100dvh-var(--header-height))] md:max-h-none md:w-[calc(100%-var(--sidebar-width))] md:max-w-none md:rounded-none md:px-7 md:pt-8 md:pb-8 xl:px-[84px]'
      : `inset-0 m-auto max-h-[calc(100dvh-48px)] w-[calc(100%-48px)] max-w-[400px] rounded-xl ${variant === 'notice' ? 'px-5 py-6' : 'p-6'} backdrop:bg-bg-dimmed/40`}`}>
    <div className={presentation === 'page' ? 'sticky top-0 z-10 -mx-5 mb-6 px-1 md:fixed md:top-0 md:left-[var(--sidebar-width)] md:right-0 md:mx-0 md:px-5 flex min-h-14 items-center justify-between gap-3 bg-bg md:mb-0' : `${variant === 'notice' ? 'mb-2' : 'mb-6'} flex items-center justify-between gap-3`}>
      {presentation === 'page' && <Button variant="ghost-neutral" size="compact" disabled={busy} onClick={onBack ?? onClose} aria-label="이전 화면"><Icon name="Back" /></Button>}
      <h2 id={titleId} className={presentation === 'page' ? 'flex-1 text-center text-base font-bold md:text-left' : variant === 'notice' ? 'text-lg font-medium leading-7' : 'text-xl font-bold'}>{title}</h2>
      <Button variant="ghost-neutral" size={variant === 'notice' ? 'icon' : 'compact'} aria-label={`${title} 닫기`} disabled={busy} onClick={onClose}>
        <Icon name="Line Close" />
      </Button>
    </div>
    {children}
  </dialog>;
}
