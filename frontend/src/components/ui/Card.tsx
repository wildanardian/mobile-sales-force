import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-xl bg-white p-4 shadow-sm', className)}>{children}</section>
  );
}

export function SectionTitle({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
      {icon && (
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white">
          {icon}
        </span>
      )}
      {children}
    </h2>
  );
}