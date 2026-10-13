import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

// Baris kecil berikon di dalam kartu daftar
export default function MetaRow({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 whitespace-nowrap text-[10.5px] text-gray-600">
      <Icon size={13} className="shrink-0 text-gray-500" />
      {children}
    </p>
  );
}
