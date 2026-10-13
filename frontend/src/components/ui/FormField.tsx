import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface Props {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}

// class seragam untuk <input>, <select>, <textarea>
// eslint-disable-next-line react-refresh/only-export-components
export const inputClass = (error?: string) =>
  cn(
    'h-11 w-full rounded-lg border bg-white px-3 text-base outline-none transition',
    'focus:ring-2 focus:ring-teal-600',
    error ? 'border-red-500' : 'border-gray-300',
  );

export default function FormField({
  label,
  error,
  hint,
  required,
  htmlFor,
  className,
  children,
}: Props) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-gray-800">
        {label}
        {required && <span className="text-red-500"> *</span>}
        {hint && <span className="ml-1 font-normal text-gray-500">({hint})</span>}
      </label>
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}