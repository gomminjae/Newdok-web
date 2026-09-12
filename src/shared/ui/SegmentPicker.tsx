import { clsx } from 'clsx';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  value: T;
  options: ReadonlyArray<Option<T>>;
  onChange: (value: T) => void;
  className?: string;
};

export function SegmentPicker<T extends string>({
  value,
  options,
  onChange,
  className,
}: Props<T>) {
  return (
    <div
      role="group"
      className={clsx(
        'relative inline-flex h-10 rounded-[6px] border border-line-neutral bg-bg-system',
        className,
      )}
    >
      <span aria-hidden="true" className="pointer-events-none absolute top-px bottom-px left-0.5 rounded-[6px] bg-bg shadow-[0_1px_2px_#0000000f] transition-transform duration-250 ease-in-out"
        style={{ width: `calc(${100 / options.length}% - 4px)`, transform: `translateX(calc(${Math.max(0, options.findIndex((option) => option.value === value)) * 100}% + ${Math.max(0, options.findIndex((option) => option.value === value)) * 4}px))` }} />
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={clsx(
            'relative z-10 min-w-0 flex-1 px-2 text-sm font-bold rounded-[6px] transition-colors duration-250 whitespace-nowrap',
            value === opt.value
              ? 'text-black'
              : 'text-[#808080]',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
