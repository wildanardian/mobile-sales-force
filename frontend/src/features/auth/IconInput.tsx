import type { InputHTMLAttributes, ReactNode } from 'react';
import { inputClass } from '../../components/ui/FormField';
import { cn } from '../../lib/cn';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string; // dibaca screen reader, tidak tampil (referensi tanpa label)
  icon: ReactNode;
  trailing?: ReactNode; // contoh: tombol tampil/sembunyi password
  error?: string;
}

// Pembungkus inputClass dari ui/FormField: menambah ikon kiri dan slot kanan
export default function IconInput({ id, label, icon, trailing, error, className, ...rest }: Props) {
  const errorId = `${id}-error`;

  return (
    <div>
      <div className="relative">
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-500">
          {icon}
        </span>
        <input
          id={id}
          aria-invalid={error != null}
          aria-describedby={error != null ? errorId : undefined}
          className={cn(
            inputClass(error),
            'rounded-[10px] pl-12 text-[15px] shadow-xs placeholder:text-slate-400',
            error == null && 'border-slate-300',
            trailing != null && 'pr-12',
            className,
          )}
          {...rest}
        />
        {trailing && <span className="absolute inset-y-0 right-0 flex items-center">{trailing}</span>}
      </div>
      {error != null && (
        <p id={errorId} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
