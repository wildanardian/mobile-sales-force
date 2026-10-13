import { useState } from 'react';
import { Search, UserRound } from 'lucide-react';
import FormField, { inputClass } from '../../components/ui/FormField';
import Select, { type SelectOption } from '../../components/ui/Select';
import { cn } from '../../lib/cn';
import type { Doctor } from '../../types/master';

interface Props {
  doctors: Doctor[];
  loading: boolean;
  value: number | null;
  onChange: (doctorId: number) => void;
  error?: string;
  disabled?: boolean;
}

// ui/Select tidak punya kolom cari, jadi pencarian dibuat sebagai input terpisah
// yang menyaring opsi Select (penyaringan lokal; backend mengirim semua dokter)
export default function DoctorSearchSelect({ doctors, loading, value, onChange, error, disabled = false }: Props) {
  const [query, setQuery] = useState('');
  const needle = query.trim().toLowerCase();

  // Dokter terpilih tetap ada di opsi walau tidak cocok dengan kata cari
  const options: SelectOption<number>[] = doctors
    .filter((d) => d.id === value || d.name.toLowerCase().includes(needle))
    .map((d) => ({ value: d.id, label: d.name, hint: d.specialization }));

  return (
    <div className="flex flex-col gap-2">
      <FormField label="Cari Dokter" htmlFor="visit-doctor-search">
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500">
            <Search size={17} />
          </span>
          <input
            id="visit-doctor-search"
            type="search"
            autoComplete="off"
            placeholder="Cari nama dokter..."
            value={query}
            disabled={disabled}
            onChange={(e) => setQuery(e.target.value)}
            className={cn(inputClass(), 'pl-9 text-sm! placeholder:text-slate-400 disabled:bg-gray-50')}
          />
        </div>
      </FormField>

      <Select
        id="visit-doctor"
        label="Dokter"
        placeholder={loading && doctors.length === 0 ? 'Memuat dokter...' : 'Pilih dokter'}
        leftIcon={<UserRound size={17} />}
        value={value}
        options={options}
        disabled={disabled || doctors.length === 0}
        error={error}
        helperText={
          needle !== '' ? `${options.length} dokter cocok dengan pencarian` : undefined
        }
        onChange={onChange}
      />
    </div>
  );
}
