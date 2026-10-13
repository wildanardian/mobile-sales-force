import { useState, type ReactNode } from 'react';
import { inputClass } from '../../components/ui/FormField';
import { cn } from '../../lib/cn';
import type { Doctor } from '../../types/msf';
import SelectedChip from './SelectedChip';

interface Props {
  id: string;
  doctors: Doctor[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  placeholder: string;
  icon: ReactNode;
  trailing?: ReactNode; // contoh: panah dropdown
  showCount?: boolean; // teks "N dokter dipilih" di kanan chip
  error?: string; // hanya untuk border merah; pesannya ditampilkan FormField
  disabled?: boolean;
  emptyText?: string; // isi dropdown saat tidak ada pilihan
}

// Kolom cari + chip terpilih DI BAWAH kolom (sesuai referensi).
// ui/ChipMultiSelect menaruh chip di dalam kolom, jadi tidak dipakai di sini.
export default function DoctorPicker({
  id, doctors, selectedIds, onChange, placeholder, icon, trailing, showCount = false,
  error, disabled = false, emptyText = 'Tidak ada data',
}: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const selected = doctors.filter((d) => selectedIds.includes(d.id));
  const matches = doctors.filter(
    (d) => !selectedIds.includes(d.id) && d.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const listId = `${id}-list`;

  const add = (doctorId: number) => {
    onChange([...selectedIds, doctorId]);
    setQuery('');
  };

  return (
    <div>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500">
          {icon}
        </span>
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          aria-invalid={error != null}
          disabled={disabled}
          placeholder={placeholder}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
          className={cn(
            inputClass(error),
            'pl-10 text-sm! placeholder:text-slate-400 disabled:bg-gray-50',
            trailing != null && 'pr-9',
          )}
        />
        {trailing != null && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-700">
            {trailing}
          </span>
        )}

        {open && (
          <ul
            id={listId}
            role="listbox"
            className="absolute inset-x-0 top-full z-30 mt-1 max-h-56 overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
          >
            {matches.length === 0 && (
              <li className="px-3 py-3 text-sm text-gray-500">{emptyText}</li>
            )}
            {matches.map((d) => (
              <li
                key={d.id}
                role="option"
                aria-selected={false}
                // mousedown agar terpilih sebelum input kehilangan fokus
                onMouseDown={(e) => { e.preventDefault(); add(d.id); }}
                className="flex min-h-11 cursor-pointer flex-col justify-center px-3 py-1.5 hover:bg-teal-50"
              >
                <span className="text-sm font-medium text-gray-900">{d.name}</span>
                <span className="text-xs text-gray-500">{d.specialization}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {(selected.length > 0 || showCount) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-1.5 gap-y-2">
          {selected.map((d) => (
            <SelectedChip
              key={d.id}
              label={d.name}
              onRemove={() => onChange(selectedIds.filter((x) => x !== d.id))}
            />
          ))}
          {showCount && (
            <p aria-live="polite" className="ml-auto text-[10.5px] text-gray-500">
              {selected.length} dokter dipilih
            </p>
          )}
        </div>
      )}
    </div>
  );
}
