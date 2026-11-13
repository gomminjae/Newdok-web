'use client';

import { useId, useRef } from 'react';

type Props<T extends string> = {
  value?: T;
  disabled?: boolean;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  label: string;
  /** Stable prefix when panels live outside this component. */
  id?: string;
};

/** The app's underline tabs. Colors and geometry are defined in the design system. */
export function Tabs<T extends string>({ value, options, onChange, label, id, disabled = false }: Props<T>) {
  const generatedId = useId();
  const prefix = id ?? generatedId;
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = options.findIndex((option) => option.value === value);
  return <div role="tablist" aria-label={label} className="nd-tabs">
    {options.map((option, index) => <button key={option.value} ref={(element) => { refs.current[index] = element; }} type="button" id={`${prefix}-tab-${option.value}`} role="tab" aria-selected={value === option.value} aria-controls={`${prefix}-panel-${option.value}`} disabled={disabled} tabIndex={value === option.value || (activeIndex < 0 && index === 0) ? 0 : -1} className="nd-tab" onClick={() => onChange(option.value)} onKeyDown={(event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + options.length) % options.length;
      onChange(options[next].value);
      refs.current[next]?.focus();
    }}>{option.label}</button>)}
    {activeIndex >= 0 && <span aria-hidden="true" className="nd-tab-indicator" style={{ width: `${100 / options.length}%`, transform: `translateX(${activeIndex * 100}%)` }} />}
  </div>;
}
