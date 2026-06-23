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
      className={clsx(
        'inline-flex p-1 rounded-full bg-bg-system',
        className,
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={clsx(
            'h-9 px-6 text-sm font-bold rounded-full transition-colors',
            value === opt.value
              ? 'bg-bg text-caption-heavy shadow-sm'
              : 'text-caption-alternative',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
