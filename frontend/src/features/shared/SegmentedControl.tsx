import { cn } from '../../lib/cn';

export interface Segment<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface Props<T extends string> {
  label: string; // untuk screen reader
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  equal?: boolean; // false = lebar mengikuti isi (label panjang)
}

export default function SegmentedControl<T extends string>({
  label, segments, value, onChange, equal = true,
}: Props<T>) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex overflow-hidden rounded-xl border border-gray-200 bg-white"
    >
      {segments.map((s) => {
        const active = s.value === value;
        return (
          <button
            key={s.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(s.value)}
            className={cn(
              'flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap font-semibold transition',
              equal ? 'flex-1 px-2 text-xs' : 'flex-auto px-1.5 text-[11px]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600',
              active
                ? 'rounded-xl bg-teal-700 text-white shadow-sm'
                : 'border-l border-gray-200 text-gray-500 first:border-l-0 hover:bg-gray-50',
            )}
          >
            {s.label}
            {s.count != null && (
              <span
                className={cn(
                  'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold',
                  active ? 'bg-white text-teal-700' : 'bg-teal-50 text-gray-600',
                )}
              >
                {s.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
