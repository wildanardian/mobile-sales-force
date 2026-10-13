import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, CalendarPlus, Clock, Save, UserRound } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, SectionTitle } from '../../components/ui/Card';
import Select, { type SelectOption } from '../../components/ui/Select';
import InlineAlert from '../shared/InlineAlert';
import { fullDateLabel, periodLabel, remainingDatesInPeriod, todayJakarta } from '../../lib/dateId';
import type { CallList } from '../../types/callList';
import type { CreateCallPlanPayload } from '../../types/callPlan';

type FieldErrors = Record<string, string>;

interface Props {
  callLists: CallList[] | null; // null = belum pernah berhasil dimuat
  callListsLoading: boolean;
  callListsError: string | null;
  onRetryCallLists: () => void;
  saving: boolean;
  serverFieldErrors: FieldErrors; // dari respons 422 yang punya `errors`
  formError: string | null; // pelanggaran aturan (duplikat, dst.) dan error non-field
  onDirty: () => void; // user mengubah input: bersihkan error server
  onSubmit?: (payload: CreateCallPlanPayload) => Promise<boolean>; // true = tersimpan
}

const DEFAULT_TIME = '08:00';

// Slot waktu setiap 15 menit, 06:00 sampai 21:00
const TIME_OPTIONS: SelectOption[] = Array.from({ length: (21 - 6) * 4 + 1 }, (_, i) => {
  const minutes = 6 * 60 + i * 15;
  const value = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
  return { value, label: value };
});

export default function CallPlanForm({
  callLists, callListsLoading, callListsError, onRetryCallLists,
  saving, serverFieldErrors, formError, onDirty, onSubmit,
}: Props) {
  const [today] = useState(todayJakarta);
  const [chosenListId, setChosenListId] = useState<number | null>(null);
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(DEFAULT_TIME);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});

  // Hanya Call List approved; yang bulannya sudah lewat tidak punya tanggal valid tersisa
  const approved = (callLists ?? [])
    .filter((c) => c.status === 'approved')
    .map((c) => ({ list: c, dates: remainingDatesInPeriod(c.period, today) }))
    .sort((a, b) => a.list.period.localeCompare(b.list.period));
  const usable = approved.filter((a) => a.dates.length > 0);

  // Nilai awal = Call List approved terdekat yang masih valid; pilihan user dipakai
  // selama masih valid (bisa berubah setelah Call List dimuat ulang)
  const current = usable.find((a) => a.list.id === chosenListId) ?? usable[0] ?? null;
  const noCallList = callLists != null && usable.length === 0;
  const locked = current == null || saving;

  const listOptions: SelectOption<number>[] = approved.map(({ list, dates }) => ({
    value: list.id,
    label: periodLabel(list.period),
    disabled: dates.length === 0,
    hint: dates.length === 0 ? 'Periode lewat' : undefined,
  }));
  // Referensi menampilkan multi-dokter; backend 1 dokter per plan
  const doctorOptions: SelectOption<number>[] = (current?.list.doctors ?? []).map((d) => ({
    value: d.id,
    label: d.name,
    hint: d.specialization,
  }));
  const dateOptions: SelectOption[] = (current?.dates ?? []).map((d) => ({ value: d, label: fullDateLabel(d) }));

  // Dokter dan tanggal hanya berlaku untuk Call List yang sedang terpilih
  const doctorValue = doctorOptions.some((o) => o.value === doctorId) ? doctorId : null;
  const dateValue = dateOptions.some((o) => o.value === date) ? date : null;

  const fieldError = (field: string) => clientErrors[field] ?? serverFieldErrors[field];

  const markDirty = () => {
    setClientErrors({});
    onDirty();
  };

  const handleListChange = (id: number) => {
    setChosenListId(id);
    // Dependent reset: dokter dan tanggal milik Call List sebelumnya tidak berlaku lagi
    setDoctorId(null);
    setDate(null);
    markDirty();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (saving || current == null) return;

    const errors: FieldErrors = {};
    if (doctorValue == null) errors.doctor_id = 'Pilih dokter.';
    if (dateValue == null) errors.plan_date = 'Pilih tanggal.';
    if (time == null) errors.plan_time = 'Pilih waktu.';
    setClientErrors(errors);
    if (doctorValue == null || dateValue == null || time == null || !onSubmit) return;

    const saved = await onSubmit({
      call_list_id: current.list.id,
      doctor_id: doctorValue,
      plan_date: dateValue,
      plan_time: time,
    });
    if (saved) {
      // Call List dan waktu dipertahankan untuk mengisi plan berikutnya
      setDoctorId(null);
      setDate(null);
    }
  };

  return (
    <Card>
      <SectionTitle icon={<CalendarPlus size={18} />}>Buat Call Plan Harian</SectionTitle>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {callListsError != null && (
          <div className="flex flex-col gap-2">
            <InlineAlert>Call List gagal dimuat. {callListsError}</InlineAlert>
            <Button variant="outline" className="self-start text-sm!" loading={callListsLoading} onClick={onRetryCallLists}>
              Coba lagi
            </Button>
          </div>
        )}

        {noCallList && (
          <p className="rounded-lg bg-teal-50 px-3 py-2.5 text-sm text-gray-700">
            Belum ada Call List yang disetujui. Ajukan Call List dan tunggu persetujuan atasan.{' '}
            <Link to="/call-list" className="font-semibold text-teal-700 underline">
              Buka Call List
            </Link>
          </p>
        )}

        <Select
          id="plan-call-list"
          label="Call List (Approved)"
          placeholder={callLists == null && callListsLoading ? 'Memuat Call List...' : 'Pilih Call List'}
          leftIcon={<CalendarDays size={17} />}
          value={current?.list.id ?? null}
          options={listOptions}
          disabled={locked}
          error={fieldError('call_list_id')}
          onChange={handleListChange}
        />

        <Select
          id="plan-doctor"
          label="Dokter"
          placeholder="Pilih dokter dari call list (approved) ..."
          leftIcon={<UserRound size={17} />}
          value={doctorValue}
          options={doctorOptions}
          disabled={locked}
          error={fieldError('doctor_id')}
          onChange={(id) => {
            setDoctorId(id);
            markDirty();
          }}
        />

        {/* Berdampingan bila cukup lebar; di layar sempit label tanggal lengkap butuh satu baris penuh */}
        <div className="grid grid-cols-1 gap-4 min-[440px]:grid-cols-[3fr_2fr] min-[440px]:gap-2.5">
          <Select
            id="plan-date"
            label="Tanggal"
            placeholder="Pilih tanggal"
            leftIcon={<CalendarDays size={17} />}
            value={dateValue}
            options={dateOptions}
            disabled={locked}
            error={fieldError('plan_date')}
            onChange={(value) => {
              setDate(value);
              markDirty();
            }}
          />
          <Select
            id="plan-time"
            label="Waktu"
            placeholder="Pilih waktu"
            leftIcon={<Clock size={17} />}
            value={time}
            options={TIME_OPTIONS}
            disabled={locked}
            error={fieldError('plan_time')}
            onChange={(value) => {
              setTime(value);
              markDirty();
            }}
          />
        </div>

        <Button type="submit" fullWidth className="text-sm!" loading={saving} disabled={current == null}>
          <Save size={17} />
          Simpan Call Plan
        </Button>

        {formError != null && <InlineAlert>{formError}</InlineAlert>}
      </form>
    </Card>
  );
}
