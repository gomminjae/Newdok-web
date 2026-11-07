'use client';

import { Button, Chip, Dialog, Icon } from '@/shared/ui';

import { useState, type ReactNode } from 'react';
import type { OptionList, OptionItem } from '@/entities/newsletter';

export function ExplorerDialog({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return <Dialog title={title} onClose={onClose}>{children}</Dialog>;
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
      <Button variant="ghost-neutral" onClick={() => { setDraftIndustries([]); setDraftDays([]); }} className="w-[88px]"><Icon name="Line Reload" size={20} />재설정</Button>
      <Button disabled={!options || !changed} onClick={() => onApply(draftIndustries, draftDays)} className="flex-1">적용하기</Button>
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
