import { X } from 'lucide-react';

interface Props {
  label: string;
  onRemove: () => void;
}

export default function SelectedChip({ label, onRemove }: Props) {
  return (
    <span className="inline-flex h-7 items-center gap-1 rounded-full bg-teal-100/70 pl-2.5 pr-0.5 text-[10.5px] font-medium text-teal-800">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Hapus ${label}`}
        className="relative flex h-6 w-6 items-center justify-center rounded-full before:absolute before:-inset-2.5 hover:bg-teal-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
      >
        <X size={12} strokeWidth={2.5} />
      </button>
    </span>
  );
}
