import { useState, type FormEvent } from 'react';
import { CalendarDays, Save, Search } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, SectionTitle } from '../../components/ui/Card';
import FormField from '../../components/ui/FormField';
import Select, { type SelectOption } from '../../components/ui/Select';
import DoctorPicker from '../shared/DoctorPicker';
import InlineAlert from '../shared/InlineAlert';
import { periodLabel, upcomingPeriods } from '../../lib/dateId';
import type { CreateCallListPayload } from '../../types/callList';
import type { Doctor } from '../../types/master';

// Bulan berjalan sampai 5 bulan ke depan
const PERIOD_COUNT = 6;

type FieldErrors = Record<string, string>;

export interface EditTarget {
  period: string; // dikunci, tidak bisa diubah
  doctorIds: number[];
  resubmit: boolean; // true = setelah tersimpan langsung diajukan ulang
}

interface Props {
  editing?: EditTarget; // tidak diisi = mode buat baru
  onCancelEdit?: () => void;
  doctors: Doctor[];
  doctorsLoading: boolean;
  doctorsError: string | null;
  onRetryDoctors: () => void;
  takenPeriods: string[]; // bulan yang sudah punya Call List milik user
  saving: boolean;
  serverFieldErrors: FieldErrors; // dari respons 422
  formError: string | null; // error non-field (409, jaringan, dst.)
  onDirty: () => void; // user mengubah input: bersihkan error server
  onSubmit: (payload: CreateCallListPayload) => Promise<boolean>; // true = tersimpan
}

// Backend memberi kunci 'doctor_ids' atau 'doctor_ids.0', 'doctor_ids.1', ...
const doctorFieldError = (errors: FieldErrors) =>
  errors.doctor_ids ?? Object.entries(errors).find(([key]) => key.startsWith('doctor_ids.'))?.[1];

export default function CallListForm({
  editing, onCancelEdit, doctors, doctorsLoading, doctorsError, onRetryDoctors, takenPeriods,
  saving, serverFieldErrors, formError, onDirty, onSubmit,
}: Props) {
  const [periods] = useState(() => upcomingPeriods(PERIOD_COUNT));
  const [chosenPeriod, setChosenPeriod] = useState<string | null>(null);
  const [doctorIds, setDoctorIds] = useState<number[]>(editing?.doctorIds ?? []);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});

  // Nilai awal = bulan pertama yang belum punya Call List; pilihan user dipakai
  // selama bulannya masih tersedia (bisa berubah setelah daftar dimuat ulang).
  const available = periods.filter((p) => !takenPeriods.includes(p));
  const createPeriod = chosenPeriod != null && available.includes(chosenPeriod) ? chosenPeriod : (available[0] ?? '');
  // Mode edit: bulan dikunci ke periode call list yang diedit
  const period = editing?.period ?? createPeriod;
  const allTaken = !editing && available.length === 0;

  const periodOptions: SelectOption[] = editing
    ? [{ value: editing.period, label: periodLabel(editing.period) }]
    : periods.map((p) => {
        const taken = takenPeriods.includes(p);
        return { value: p, label: periodLabel(p), disabled: taken, hint: taken ? 'Sudah ada' : undefined };
      });
  const periodHelper = editing
    ? 'Bulan tidak bisa diubah'
    : allTaken
      ? 'Semua bulan sudah memiliki Call List'
      : undefined;

  const periodError = clientErrors.period ?? serverFieldErrors.period;
  const doctorsFieldError = clientErrors.doctor_ids ?? doctorFieldError(serverFieldErrors);

  const markDirty = () => {
    setClientErrors({});
    onDirty();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (saving || allTaken) return;

    const errors: FieldErrors = {};
    if (period === '') errors.period = 'Pilih bulan terlebih dahulu.';
    if (doctorIds.length === 0) errors.doctor_ids = 'Pilih minimal 1 dokter.';
    setClientErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const saved = await onSubmit({ period, doctor_ids: doctorIds });
    if (saved) {
      setChosenPeriod(null);
      setDoctorIds([]);
    }
  };

  return (
    <Card>
      <SectionTitle icon={<CalendarDays size={18} />}>
        {editing ? 'Edit Call List' : 'Buat Call List Bulanan'}
      </SectionTitle>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Select
          id="period"
          label="Pilih Bulan"
          placeholder="Pilih bulan"
          leftIcon={<CalendarDays size={17} />}
          value={period === '' ? null : period}
          options={periodOptions}
          disabled={editing != null || allTaken || saving}
          error={periodError}
          helperText={periodHelper}
          onChange={(value) => {
            setChosenPeriod(value);
            markDirty();
          }}
        />

        <FormField label="Pilih Dokter" hint="Multi Select" htmlFor="doctors" error={doctorsFieldError}>
          <DoctorPicker
            id="doctors"
            doctors={doctors}
            selectedIds={doctorIds}
            onChange={(ids) => {
              setDoctorIds(ids);
              markDirty();
            }}
            placeholder="Cari nama dokter..."
            icon={<Search size={17} />}
            showCount
            error={doctorsFieldError}
            disabled={allTaken || saving}
            emptyText={doctorsLoading ? 'Memuat dokter...' : 'Tidak ada data'}
          />
        </FormField>

        {doctorsError != null && (
          <div className="flex flex-col gap-2">
            <InlineAlert>Daftar dokter gagal dimuat. {doctorsError}</InlineAlert>
            <Button variant="outline" className="self-start text-sm!" loading={doctorsLoading} onClick={onRetryDoctors}>
              Coba lagi
            </Button>
          </div>
        )}

        <Button type="submit" fullWidth className="text-sm!" loading={saving} disabled={allTaken}>
          <Save size={17} />
          {!editing ? 'Simpan sebagai Draft' : editing.resubmit ? 'Simpan & Submit Ulang' : 'Simpan'}
        </Button>
        {editing && (
          <Button variant="outline" fullWidth className="-mt-1.5 text-sm!" disabled={saving} onClick={onCancelEdit}>
            Batal
          </Button>
        )}

        {formError != null && <InlineAlert>{formError}</InlineAlert>}
      </form>
    </Card>
  );
}
