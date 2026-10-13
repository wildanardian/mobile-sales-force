import { CircleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

// Alert merah di dalam form (pesan error tingkat form)
export default function InlineAlert({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-center gap-2.5 rounded-lg border border-red-300 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600',
        className,
      )}
    >
      <CircleAlert size={20} className="shrink-0 fill-red-500 text-red-50" />
      <span>{children}</span>
    </div>
  );
}
