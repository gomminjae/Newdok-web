'use client';

import { Button, Chip } from '@/shared/ui';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import type { OptionList, OptionItem } from '@/entities/newsletter';

export function ExplorerDialog({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
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

  return <dialog ref={ref} aria-labelledby={titleId} onCancel={onClose}
    onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
    }}
    className={`fixed inset-x-0 top-auto bottom-0 m-0 max-h-[90dvh] w-full max-w-none overflow-y-auto rounded-t-[24px] bg-bg px-6 pt-5 pb-[calc(22px+env(safe-area-inset-bottom))] text-caption-strong backdrop:bg-black/40 sm:inset-0 sm:m-auto sm:max-h-[calc(100dvh-32px)] sm:w-[calc(100%-32px)] sm:max-w-[600px] sm:rounded-[24px] sm:p-6 ${title === '정렬' ? 'min-h-[280px] sm:min-h-0' : ''}`}>
    <span aria-hidden="true" className={`mx-auto block h-[5px] w-10 rounded-full bg-caption-assistive/50 sm:hidden ${title === '정렬' ? 'mb-8' : 'mb-4'}`} />
    <div className="flex items-center justify-between">
      <h2 id={titleId} className="text-xl font-bold">{title}</h2>
      <button type="button" aria-label={`${title} 닫기`} onClick={onClose} className="-mr-2 -my-2 flex h-11 w-11 items-center justify-center rounded-full hover:bg-bg-system">
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </button>
    </div>
    {children}
  </dialog>;
}

export function NewsletterFilters({ options, industries, days, onClose, onApply, isError, retry }: {
  options?: OptionList;
  industries: string[];
  days: string[];
  onClose: () => void;
  onApply: (industries: string[], days: string[]) => void;
  isError: boolean;
  retry: () => void;
}) {
  const [draftIndustries, setDraftIndustries] = useState(industries);
  const [draftDays, setDraftDays] = useState(days);
  const changed = draftIndustries.join(',') !== industries.join(',') || draftDays.join(',') !== days.join(',');

  function toggle(current: string[], id: string) {
    return (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]).sort((a, b) => Number(a) - Number(b));
  }

  return <ExplorerDialog title="필터" onClose={onClose}>
    {isError ? <div role="alert" className="py-8 text-center text-sm">
      <p>필터를 불러오지 못했어요.</p><Button variant="ghost" size="compact" onClick={retry} className="mt-3">다시 시도</Button>
    </div> : !options ? <p role="status" className="py-8 text-sm">필터를 불러오는 중이에요.</p> : <>
      <FilterGroup title="산업 카테고리" items={options.industries} selected={draftIndustries} onToggle={(id) => setDraftIndustries((values) => toggle(values, id))} />
      <FilterGroup title="발행요일" items={options.days} selected={draftDays} onToggle={(id) => setDraftDays((values) => toggle(values, id))} />
    </>}
    <div className="mt-7 flex items-center gap-3">
      <Button variant="ghost-neutral" size="short" onClick={() => { setDraftIndustries([]); setDraftDays([]); }} className="w-[88px]"><span aria-hidden="true">↻</span>재설정</Button>
      <Button size="short" disabled={!options || !changed} onClick={() => onApply(draftIndustries, draftDays)} className="flex-1">적용하기</Button>
    </div>
  </ExplorerDialog>;
}

function FilterGroup({ title, items, selected, onToggle }: { title: string; items: OptionItem[]; selected: string[]; onToggle: (id: string) => void }) {
  return <fieldset className="mt-[22px] first-of-type:mt-4">
    <legend className="mb-2 text-sm font-medium text-caption-neutral">{title}</legend>
    <div className="flex flex-wrap gap-2.5">
      {items.map((item) => <Chip key={item.id} as="button" active={selected.includes(String(item.id))} onClick={() => onToggle(String(item.id))}>
        {item.name}
      </Chip>)}
    </div>
  </fieldset>;
}
