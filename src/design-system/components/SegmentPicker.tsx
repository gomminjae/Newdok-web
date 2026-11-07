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
        'nd-segment',
        className,
      )}
    >
      <span aria-hidden="true" className="nd-segment-thumb"
        style={{ width: `calc(100% / ${options.length} - 4px)`, left: `calc(${Math.max(0, options.findIndex((option) => option.value === value)) * 100 / options.length}% + 2px)` }} />
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
          className="nd-segment-option"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
