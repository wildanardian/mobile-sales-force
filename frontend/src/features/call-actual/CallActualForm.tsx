import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CalendarDays, Clock, Image, PenLine, UserRound } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import ChipMultiSelect, { type Option } from '../../components/ui/ChipMultiSelect';
import FormField from '../../components/ui/FormField';
import Select, { type SelectOption } from '../../components/ui/Select';
import InlineAlert from '../shared/InlineAlert';
import SegmentedControl, { type Segment } from '../shared/SegmentedControl';
import DoctorSearchSelect from './DoctorSearchSelect';
import UrlPreviewInput from './UrlPreviewInput';
import { useJakartaClock } from '../../hooks/useJakartaClock';
import { dateLabel, fullDateLabel, shiftDate } from '../../lib/dateId';
import { isHttpUrl } from '../../lib/url';
import type { CallActual, CreateCallActualPayload } from '../../types/callActual';
import type { CallPlan } from '../../types/callPlan';
import type { Doctor, Product } from '../../types/master';

// Mode hanya mengatur field yang tampil. Jenis kunjungan (planned/unplan/non_target)
// ditentukan backend dan mode ini tidak pernah dikirim ke API.
type Mode = 'plan' | 'no_plan';

const MODES: Segment<Mode>[] = [
  { value: 'plan', label: 'Sesuai Call Plan' },
  { value: 'no_plan', label: 'Tanpa Call Plan' },
];

const MAX_BACKDATE_DAYS = 7; // sama dengan batas di backend

// Slot jam setiap 5 menit, 06:00 sampai 22:00
const TIME_SLOTS: string[] = Array.from({ length: (22 - 6) * 12 + 1 }, (_, i) => {
  const minutes = 6 * 60 + i * 5;
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
});

// 'dr. Andi Pratama, Sp.PD' -> 'dr. Andi Pratama'
const shortName = (name: string) => name.split(',')[0];

type FieldErrors = Record<string, string>;

const urlError = (value: string, emptyMessage: string) => {
  if (value.trim() === '') return emptyMessage;
  return isHttpUrl(value) ? undefined : 'URL harus diawali http:// atau https://';
};

// Backend memberi kunci 'products' atau 'products.0', 'products.1', ...
const productsError = (errors: FieldErrors) =>
  errors.products ?? Object.entries(errors).find(([key]) => key.startsWith('products.'))?.[1];

const newestFirst = (a: CallPlan, b: CallPlan) =>
  b.plan_date.localeCompare(a.plan_date) || b.plan_time.localeCompare(a.plan_time);

interface Props {
  plans: CallPlan[] | null; // null = belum pernah berhasil dimuat
  plansLoading: boolean;
  plansError: string | null;
  onRetryPlans: () => void;
  visits: CallActual[] | null; // untuk mengetahui plan yang sudah dikunjungi
  doctors: Doctor[] | null;
  doctorsLoading: boolean;
  doctorsError: string | null;
  onRetryDoctors: () => void;
  products: Product[] | null;
  productsLoading: boolean;
  productsError: string | null;
  onRetryProducts: () => void;
  saving: boolean;
  serverFieldErrors: FieldErrors; // dari respons 422 yang punya `errors`
  formError: string | null; // double visit, pelanggaran aturan, dan error non-field
  onDirty: () => void; // user mengubah input: bersihkan error server
  onSubmit: (payload: CreateCallActualPayload) => Promise<boolean>; // true = tersimpan
}

export default function CallActualForm({
  plans, plansLoading, plansError, onRetryPlans, visits,
  doctors, doctorsLoading, doctorsError, onRetryDoctors,
  products, productsLoading, productsError: productsLoadError, onRetryProducts,
  saving, serverFieldErrors, formError, onDirty, onSubmit,
}: Props) {
  const { today, time: nowTime } = useJakartaClock();
  const [mode, setMode] = useState<Mode>('plan');
  const [chosenPlanId, setChosenPlanId] = useState<number | null>(null);
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [chosenDate, setChosenDate] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [signatureUrl, setSignatureUrl] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Option[]>([]);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});

  // Plan yang bisa diaktualisasi: berstatus planned, belum punya kunjungan (dicocokkan
  // dengan plan_id pada riwayat), dan tanggalnya antara 7 hari lalu sampai hari ini.
  const earliest = shiftDate(today, -MAX_BACKDATE_DAYS);
  const visitedPlanIds = new Set((visits ?? []).map((v) => v.plan_id));
  const eligiblePlans = (plans ?? [])
    .filter(
      (p) =>
        p.status === 'planned' &&
        p.plan_date >= earliest &&
        p.plan_date <= today &&
        !visitedPlanIds.has(p.id),
    )
    .sort(newestFirst);
  const plan = eligiblePlans.find((p) => p.id === chosenPlanId) ?? eligiblePlans[0] ?? null;
  const noPlan = plans != null && eligiblePlans.length === 0;

  const planOptions: SelectOption<number>[] = eligiblePlans.map((p) => ({
    value: p.id,
    label: `${dateLabel(p.plan_date)} - ${shortName(p.doctor.name)}`,
  }));

  // Mode tanpa plan: 8 pilihan tanggal, hari ini sampai 7 hari ke belakang
  const dateOptions: SelectOption[] = Array.from({ length: MAX_BACKDATE_DAYS + 1 }, (_, i) => {
    const date = shiftDate(today, -i);
    return { value: date, label: fullDateLabel(date) };
  });
  const freeDate = dateOptions.some((o) => o.value === chosenDate) ? chosenDate : today;

  // Mode plan: tanggal dan dokter diturunkan dari plan terpilih, tidak bisa diubah
  const visitDate = mode === 'plan' ? (plan?.plan_date ?? null) : freeDate;

  const productOptions: Option[] = (products ?? []).map((p) => ({ value: p.id, label: p.name }));

  const fieldError = (field: string) => clientErrors[field] ?? serverFieldErrors[field];
  // Mode plan tidak punya field dokter/tanggal sendiri, jadi error keduanya ikut tampil di pemilih plan
  const planFieldError = fieldError('plan_id') ?? fieldError('doctor_id') ?? fieldError('visit_date');
  const productsFieldError = clientErrors.products ?? productsError(serverFieldErrors);

  const markDirty = () => {
    setClientErrors({});
    onDirty();
  };

  const handleModeChange = (next: Mode) => {
    // Field milik mode sebelumnya tidak relevan lagi
    setMode(next);
    setChosenPlanId(null);
    setDoctorId(null);
    setChosenDate(null);
    markDirty();
  };

  const resetForm = () => {
    setChosenPlanId(null);
    setDoctorId(null);
    setChosenDate(null);
    setCheckIn(null);
    setCheckOut(null);
    setPhotoUrl('');
    setSignatureUrl('');
    setSelectedProducts([]);
  };

  // Kunjungan hari ini tidak boleh melewati jam sekarang; check-out harus setelah check-in
  const timeLimit = visitDate === today ? nowTime : null;
  const afterLimit = (t: string) => timeLimit != null && t > timeLimit;
  const checkInValue = checkIn != null && !afterLimit(checkIn) ? checkIn : null;
  const checkOutBlocked = (t: string) => afterLimit(t) || (checkInValue != null && t <= checkInValue);
  const checkOutValue = checkOut != null && !checkOutBlocked(checkOut) ? checkOut : null;
  const checkInOptions: SelectOption[] = TIME_SLOTS.map((t) => ({ value: t, label: t, disabled: afterLimit(t) }));
  const checkOutOptions: SelectOption[] = TIME_SLOTS.map((t) => ({ value: t, label: t, disabled: checkOutBlocked(t) }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (saving) return;

    const targetDoctorId = mode === 'plan' ? (plan?.doctor_id ?? null) : doctorId;
    const errors: FieldErrors = {};
    if (mode === 'plan' && plan == null) errors.plan_id = 'Pilih Call Plan.';
    if (mode === 'no_plan' && doctorId == null) errors.doctor_id = 'Pilih dokter.';
    if (checkInValue == null) errors.check_in = 'Pilih jam check-in.';
    if (checkOutValue == null) errors.check_out = 'Pilih jam check-out.';
    else if (checkInValue != null && checkOutValue <= checkInValue) errors.check_out = 'Check-out harus setelah check-in.';
    const photoMessage = urlError(photoUrl, 'Foto wajib diisi');
    if (photoMessage) errors.photo_url = photoMessage;
    const signatureMessage = urlError(signatureUrl, 'Tanda tangan wajib diisi');
    if (signatureMessage) errors.signature_url = signatureMessage;
    if (selectedProducts.length === 0) errors.products = 'Pilih minimal 1 produk.';
    setClientErrors(errors);
    if (
      Object.keys(errors).length > 0 ||
      targetDoctorId == null || visitDate == null || checkInValue == null || checkOutValue == null
    ) {
      return;
    }

    const saved = await onSubmit({
      plan_id: mode === 'plan' ? (plan?.id ?? null) : null,
      doctor_id: targetDoctorId,
      visit_date: visitDate,
      check_in: `${checkInValue}:00`,
      check_out: `${checkOutValue}:00`,
      photo_url: photoUrl.trim(),
      signature_url: signatureUrl.trim(),
      products: selectedProducts.map((p) => p.value),
    });
    if (saved) resetForm();
  };

  return (
    <>
      <SegmentedControl label="Cara mencatat kunjungan" segments={MODES} value={mode} onChange={handleModeChange} />

      <Card>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {mode === 'plan' && (
            <>
              {plansError != null && (
                <div className="flex flex-col gap-2">
                  <InlineAlert>Call Plan gagal dimuat. {plansError}</InlineAlert>
                  <Button variant="outline" className="self-start text-sm!" loading={plansLoading} onClick={onRetryPlans}>
                    Coba lagi
                  </Button>
                </div>
              )}

              {noPlan && (
                <p className="rounded-lg bg-teal-50 px-3 py-2.5 text-sm text-gray-700">
                  Tidak ada Call Plan yang bisa diaktualisasi.{' '}
                  <Link to="/call-plan" className="font-semibold text-teal-700 underline">
                    Buka Call Plan
                  </Link>
                </p>
              )}

              <Select
                id="visit-plan"
                label="Pilih Call Plan"
                placeholder={plans == null && plansLoading ? 'Memuat Call Plan...' : 'Pilih Call Plan'}
                leftIcon={<Calendar size={17} />}
                value={plan?.id ?? null}
                options={planOptions}
                disabled={plan == null || saving}
                error={planFieldError}
                onChange={(id) => {
                  setChosenPlanId(id);
                  markDirty();
                }}
              />

              {plan != null && (
                <dl className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 rounded-lg bg-gray-50 px-3 py-2.5 text-sm">
                  <dt className="flex items-center gap-2 text-gray-500">
                    <UserRound size={15} /> Dokter
                  </dt>
                  <dd className="font-medium text-gray-900">{plan.doctor.name}</dd>
                  <dt className="flex items-center gap-2 text-gray-500">
                    <CalendarDays size={15} /> Tanggal
                  </dt>
                  <dd className="font-medium text-gray-900">{fullDateLabel(plan.plan_date)}</dd>
                </dl>
              )}
            </>
          )}

          {mode === 'no_plan' && (
            <>
              {doctorsError != null && (
                <div className="flex flex-col gap-2">
                  <InlineAlert>Daftar dokter gagal dimuat. {doctorsError}</InlineAlert>
                  <Button variant="outline" className="self-start text-sm!" loading={doctorsLoading} onClick={onRetryDoctors}>
                    Coba lagi
                  </Button>
                </div>
              )}

              <DoctorSearchSelect
                doctors={doctors ?? []}
                loading={doctorsLoading}
                value={doctorId}
                error={fieldError('doctor_id')}
                disabled={saving}
                onChange={(id) => {
                  setDoctorId(id);
                  markDirty();
                }}
              />

              <Select
                id="visit-date"
                label="Tanggal Kunjungan"
                leftIcon={<CalendarDays size={17} />}
                value={freeDate}
                options={dateOptions}
                disabled={saving}
                error={fieldError('visit_date')}
                onChange={(date) => {
                  setChosenDate(date);
                  markDirty();
                }}
              />
            </>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <Select
              id="visit-check-in"
              label="Check-in"
              placeholder="Pilih jam"
              leftIcon={<Clock size={17} />}
              value={checkInValue}
              options={checkInOptions}
              disabled={saving}
              error={fieldError('check_in')}
              onChange={(t) => {
                setCheckIn(t);
                markDirty();
              }}
            />
            <Select
              id="visit-check-out"
              label="Check-out"
              placeholder="Pilih jam"
              leftIcon={<Clock size={17} />}
              value={checkOutValue}
              options={checkOutOptions}
              disabled={saving}
              error={fieldError('check_out')}
              onChange={(t) => {
                setCheckOut(t);
                markDirty();
              }}
            />
          </div>

          <p className="text-sm text-muted-foreground">
            <button
              type="button"
              className="text-blue-500 hover:underline text-xs"
              onClick={() => {
                setPhotoUrl('https://example.com/foto.jpg');
                setSignatureUrl('https://example.com/signature.jpg');
                markDirty();
              }}
            >
              Isi otomatis URL Foto dan Tanda Tangan
            </button>
          </p>

          <FormField label="URL Foto" htmlFor="visit-photo" error={fieldError('photo_url')}>
            <UrlPreviewInput
              id="visit-photo"
              icon={<Image size={17} />}
              placeholder="https://example.com/foto.jpg"
              value={photoUrl}
              onChange={(value) => {
                setPhotoUrl(value);
                markDirty();
              }}
              previewAlt="Pratinjau foto kunjungan"
              error={fieldError('photo_url')}
              disabled={saving}
            />
          </FormField>

          <FormField label="URL Tanda Tangan" htmlFor="visit-signature" error={fieldError('signature_url')}>
            <UrlPreviewInput
              id="visit-signature"
              icon={<PenLine size={17} />}
              placeholder="https://example.com/signature.jpg"
              value={signatureUrl}
              onChange={(value) => {
                setSignatureUrl(value);
                markDirty();
              }}
              previewAlt="Pratinjau tanda tangan"
              error={fieldError('signature_url')}
              disabled={saving}
            />
          </FormField>

          <FormField label="Produk yang di-detailing" error={productsFieldError}>
            <ChipMultiSelect
              options={productOptions}
              value={selectedProducts}
              onChange={(value) => {
                setSelectedProducts(value);
                markDirty();
              }}
              placeholder="Cari dan pilih produk..."
              isLoading={products == null && productsLoading}
              hasError={productsFieldError != null}
            />
          </FormField>

          {productsLoadError != null && (
            <div className="flex flex-col gap-2">
              <InlineAlert>Daftar produk gagal dimuat. {productsLoadError}</InlineAlert>
              <Button variant="outline" className="self-start text-sm!" loading={productsLoading} onClick={onRetryProducts}>
                Coba lagi
              </Button>
            </div>
          )}

          {formError != null && <InlineAlert>{formError}</InlineAlert>}

          <Button type="submit" fullWidth className="text-sm!" loading={saving}>
            Submit Kunjungan
          </Button>
        </form>
      </Card>
    </>
  );
}
