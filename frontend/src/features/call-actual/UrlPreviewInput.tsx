import { useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { inputClass } from '../../components/ui/FormField';
import { cn } from '../../lib/cn';
import VisitThumb from './VisitThumb';

interface Props {
  id: string;
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  previewAlt: string;
  error?: string; // hanya untuk border merah; pesannya ditampilkan FormField
  disabled?: boolean;
}

// Input URL dengan ikon kiri dan thumbnail pratinjau di kanan.
// Pratinjau baru dimuat setelah user selesai mengetik (blur), agar tidak ada
// request gambar untuk setiap ketikan; VisitThumb menolak URL non-http(s).
export default function UrlPreviewInput({
  id, icon, value, onChange, placeholder, previewAlt, error, disabled = false,
}: Props) {
  const [committed, setCommitted] = useState('');
  const trimmed = value.trim();
  const showPreview = trimmed !== '' && committed === trimmed;

  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500">
        {icon}
      </span>
      <input
        id={id}
        type="url"
        inputMode="url"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        aria-invalid={error != null}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setCommitted(trimmed)}
        className={cn(
          inputClass(error),
          'pl-9 text-sm! placeholder:text-slate-400 disabled:bg-gray-50',
          showPreview && 'pr-[62px]',
        )}
      />
      {showPreview && (
        <span className="absolute right-1.5 top-1/2 h-8 w-12 -translate-y-1/2">
          <VisitThumb src={trimmed} alt={previewAlt} className="h-full w-full" />
          <button
            type="button"
            onClick={() => {
              onChange('');
              setCommitted('');
            }}
            aria-label={`Kosongkan ${previewAlt.toLowerCase()}`}
            className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-700 text-white before:absolute before:-inset-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            <X size={10} strokeWidth={3} />
          </button>
        </span>
      )}
    </div>
  );
}
