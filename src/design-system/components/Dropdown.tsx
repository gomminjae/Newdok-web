'use client';

import { clsx } from 'clsx';
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from './Icon';

export type DropdownOption = { value: string; label: string; disabled?: boolean };
export type DropdownProps = {
  id?: string;
  name?: string;
  value: string;
  options: readonly DropdownOption[];
  onValueChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
};

/** App dropdown: 48px trigger/rows, 4px corners and an overlay list. */
export function Dropdown({ id, name, value, options, onValueChange, placeholder, disabled = false, required, className, ...aria }: DropdownProps) {
  const generatedId = useId();
  const triggerId = id ?? generatedId;
  const listId = `${triggerId}-options`;
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const rows = useRef<Array<HTMLLIElement | null>>([]);
  const search = useRef({ text: '', time: 0 });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState({ side: 'below', height: 256 });
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = options[selectedIndex];
  const enabled = options.map((option, index) => option.disabled ? -1 : index).filter((index) => index >= 0);

  const measure = useCallback(() => {
    const element = root.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const dialog = element.closest('dialog')?.getBoundingClientRect();
    const viewport = window.visualViewport;
    const top = Math.max(dialog?.top ?? 0, viewport?.offsetTop ?? 0);
    const bottom = Math.min(dialog?.bottom ?? window.innerHeight, (viewport?.offsetTop ?? 0) + (viewport?.height ?? window.innerHeight));
    const below = bottom - rect.bottom - 16;
    const above = rect.top - top - 16;
    const side = below < Math.min(256, options.length * 48 + 16) && above > below ? 'above' : 'below';
    setPosition({ side, height: Math.max(64, Math.min(256, side === 'above' ? above : below)) });
  }, [options.length]);

  function expand(last = false) {
    if (disabled || !enabled.length) return;
    measure();
    setActive(selectedIndex >= 0 && !selected?.disabled ? selectedIndex : enabled[last ? enabled.length - 1 : 0]);
    setOpen(true);
  }

  function choose(index: number) {
    const option = options[index];
    if (!option || option.disabled || disabled) return;
    onValueChange(option.value);
    setOpen(false);
    trigger.current?.focus();
  }

  function keyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.nativeEvent.isComposing || disabled) return;
    if (event.key === 'Tab') { setOpen(false); return; }
    if (event.key === 'Escape') { if (open) { event.preventDefault(); event.stopPropagation(); setOpen(false); } return; }
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); if (open) choose(active); else expand(); return; }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      if (!open) { expand(event.key === 'ArrowUp' || event.key === 'End'); return; }
      if (!enabled.length) return;
      const current = enabled.indexOf(active);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? enabled.length - 1 : (current + (event.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length;
      setActive(enabled[next]);
      return;
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const now = Date.now();
      search.current = { text: now - search.current.time < 600 ? search.current.text + event.key : event.key, time: now };
      const next = enabled.find((index) => options[index].label.toLocaleLowerCase().startsWith(search.current.text.toLocaleLowerCase()));
      if (next !== undefined) { if (!open) expand(); setActive(next); }
    }
  }

  useEffect(() => {
    if (!open) return;
    function outside(event: PointerEvent) { if (!root.current?.contains(event.target as Node)) setOpen(false); }
    function reposition() { measure(); }
    document.addEventListener('pointerdown', outside, true);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    window.visualViewport?.addEventListener('resize', reposition);
    return () => {
      document.removeEventListener('pointerdown', outside, true);
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
      window.visualViewport?.removeEventListener('resize', reposition);
    };
  }, [open, measure]);

  useEffect(() => {
    if (open) rows.current[active]?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  return <div ref={root} className={clsx('nd-dropdown', className)} data-open={open && !disabled} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <button {...aria} ref={trigger} id={triggerId} type="button" role="combobox" aria-haspopup="listbox" aria-expanded={open && !disabled} aria-controls={listId} aria-activedescendant={open && !disabled ? `${listId}-${active}` : undefined} aria-required={required || undefined} disabled={disabled || !enabled.length} className="nd-dropdown-trigger" data-placeholder={!selected} onClick={() => open ? setOpen(false) : expand()} onKeyDown={keyDown}>
      <span className="min-w-0 truncate">{selected?.label ?? placeholder}</span><Icon name={open && !disabled ? 'Line Up' : 'Line Down'} />
    </button>
    {name && <input type="hidden" name={name} value={value} disabled={disabled} />}
    <ul hidden={!open || disabled} id={listId} role="listbox" aria-labelledby={triggerId} className="nd-dropdown-list" data-side={position.side} style={{ maxHeight: position.height }}>
      {options.map((option, index) => <li key={option.value} ref={(element) => { rows.current[index] = element; }} id={`${listId}-${index}`} role="option" aria-selected={option.value === value} aria-disabled={option.disabled || undefined} className="nd-dropdown-option" data-active={index === active} onPointerMove={() => { if (!option.disabled) setActive(index); }} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(index)}>{option.label}</li>)}
    </ul>
  </div>;
}
