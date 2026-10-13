import { useState } from 'react';
import CallActualForm from '../features/call-actual/CallActualForm';
import VisitHistorySection from '../features/call-actual/VisitHistorySection';
import InlineToast from '../features/shared/InlineToast';
import { useAction } from '../hooks/useAction';
import { useFetch } from '../hooks/useFetch';
import { currentPeriod } from '../lib/dateId';
import { callActualService } from '../services/callActualService';
import { callPlanService } from '../services/callPlanService';
import { masterService } from '../services/masterService';
import type { CreateCallActualPayload, VisitType } from '../types/callActual';
import type { ParsedError } from '../utils/errorMessage';

interface Toast {
  tone: 'success' | 'error';
  message: string;
}

const NO_FIELD_ERRORS: Record<string, string> = {};

const VISIT_TYPE_LABEL: Record<VisitType, string> = {
  planned: 'Planned',
  unplan: 'Unplan',
  non_target: 'Non Target',
};

const hasFieldErrors = (error: ParsedError) => Object.keys(error.fieldErrors).length > 0;

// Double visit dan konflik plan dibalas 409; pelanggaran aturan lain (tanggal, dokter
// tidak sesuai plan, dst.) dibalas 422 TANPA `errors`. Validasi field adalah 422 DENGAN `errors`.
const isRuleViolation = (error: ParsedError) =>
  error.status === 409 || (error.status === 422 && !hasFieldErrors(error));

export default function CallActualPage() {
  // Request awal berjalan paralel; kegagalan salah satu tidak menutupi yang lain
  const visits = useFetch(callActualService.getAll);
  const plans = useFetch(callPlanService.getAll);
  const doctors = useFetch(masterService.getDoctors);
  const products = useFetch(masterService.getProducts);

  const [thisMonth] = useState(currentPeriod);
  const [month, setMonth] = useState(thisMonth);
  const [toast, setToast] = useState<Toast | null>(null);

  const create = useAction(callActualService.create, (error) => {
    if (error.status === 403) setToast({ tone: 'error', message: error.message });
    // Data di layar mungkin sudah tidak sesuai kondisi server: muat ulang riwayat dan plan
    if (isRuleViolation(error)) {
      visits.refetch();
      plans.refetch();
    }
  });

  // 422 ber-`errors` tampil di bawah field, 403 sebagai toast,
  // sisanya (termasuk double visit) sebagai alert merah di atas tombol
  const formError =
    create.error && create.error.status !== 403 && !(create.error.status === 422 && hasFieldErrors(create.error))
      ? create.error.message
      : null;

  const handleCreate = async (payload: CreateCallActualPayload) => {
    setToast(null);
    const created = await create.execute(payload);
    if (!created) return false;
    // Jenis kunjungan ditentukan backend, jadi diambil dari respons
    setToast({ tone: 'success', message: `Kunjungan tercatat sebagai ${VISIT_TYPE_LABEL[created.visit_type]}` });
    setMonth(created.visit_date.slice(0, 7)); // tampilkan bulan kunjungan yang baru dicatat
    visits.refetch();
    plans.refetch();
    return true;
  };

  return (
    <>
      {toast && (
        <div className="sticky top-14 z-30">
          <InlineToast tone={toast.tone} onClose={() => setToast(null)}>
            {toast.message}
          </InlineToast>
        </div>
      )}

      <CallActualForm
        plans={plans.data}
        plansLoading={plans.loading}
        plansError={plans.error}
        onRetryPlans={plans.refetch}
        visits={visits.data}
        doctors={doctors.data}
        doctorsLoading={doctors.loading}
        doctorsError={doctors.error}
        onRetryDoctors={doctors.refetch}
        products={products.data}
        productsLoading={products.loading}
        productsError={products.error}
        onRetryProducts={products.refetch}
        saving={create.loading}
        serverFieldErrors={create.error?.fieldErrors ?? NO_FIELD_ERRORS}
        formError={formError}
        onDirty={create.clearError}
        onSubmit={handleCreate}
      />

      <VisitHistorySection
        visits={visits.data}
        loading={visits.loading}
        error={visits.error}
        onRetry={visits.refetch}
        thisMonth={thisMonth}
        month={month}
        onMonthChange={setMonth}
      />
    </>
  );
}
