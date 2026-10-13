import { CircleAlert, CircleCheck, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface Props {
  tone: 'success' | 'error';
  children: ReactNode;
  onClose: () => void;
  className?: string;
}

const tones = {
  success: {
    box: 'border border-green-300 bg-green-50 text-green-900',
    icon: <CircleCheck size={18} className="shrink-0 fill-green-600 text-green-50" />,
  },
  error: {
    box: 'bg-red-500 text-white',
    icon: <CircleAlert size={18} className="shrink-0 fill-white text-red-500" />,
  },
};

// Toast statis yang bisa ditutup (bukan hasil pemanggilan API)
export default function InlineToast({ tone, children, onClose, className }: Props) {
  const t = tones[tone];

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex items-center gap-2 rounded-lg pl-3 text-xs font-medium shadow-sm', t.box, className)}
    >
      {t.icon}
      <span className="flex-1 py-2">{children}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup notifikasi"
        className="-my-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
      >
        <X size={15} />
      </button>
    </div>
  );
}
