import { useState } from 'react';
import CallPlanForm from '../features/call-plan/CallPlanForm';
import CallPlanListSection from '../features/call-plan/CallPlanListSection';
import InlineToast from '../features/shared/InlineToast';
import { useAction } from '../hooks/useAction';
import { useFetch } from '../hooks/useFetch';
import { currentPeriod } from '../lib/dateId';
import { callListService } from '../services/callListService';
import { callPlanService } from '../services/callPlanService';
import type { CreateCallPlanPayload } from '../types/callPlan';
import type { ParsedError } from '../utils/errorMessage';

interface Toast {
  tone: 'success' | 'error';
  message: string;
}

const NO_FIELD_ERRORS: Record<string, string> = {};

const hasFieldErrors = (error: ParsedError) => Object.keys(error.fieldErrors).length > 0;

// Backend membalas pelanggaran aturan (duplikat dokter+tanggal, Call List belum
// approved, dokter bukan anggota Call List, tanggal di luar periode/lampau)
// dengan 422 TANPA `errors`, atau 409. Validasi field biasa adalah 422 DENGAN `errors`.
const isRuleViolation = (error: ParsedError) =>
  error.status === 409 || (error.status === 422 && !hasFieldErrors(error));

export default function CallPlanPage() {
  // Dua request awal berjalan paralel; kegagalan salah satu tidak menutupi yang lain
  const callLists = useFetch(callListService.getAll);
  const plans = useFetch(callPlanService.getAll);

  const [thisMonth] = useState(currentPeriod);
  const [month, setMonth] = useState(thisMonth);
  const [toast, setToast] = useState<Toast | null>(null);

  const create = useAction(callPlanService.create, (error) => {
    if (error.status === 403) setToast({ tone: 'error', message: error.message });
    // Pilihan di form mungkin sudah tidak sesuai kondisi server: muat ulang Call List
    if (isRuleViolation(error)) callLists.refetch();
  });

  // 422 ber-`errors` tampil di bawah field, 403 sebagai toast,
  // sisanya (termasuk duplikat) sebagai alert merah di bawah tombol
  const formError =
    create.error && create.error.status !== 403 && !(create.error.status === 422 && hasFieldErrors(create.error))
      ? create.error.message
      : null;

  const handleCreate = async (payload: CreateCallPlanPayload) => {
    setToast(null);
    const created = await create.execute(payload);
    if (!created) return false;
    setToast({ tone: 'success', message: 'Call Plan berhasil dibuat' });
    setMonth(created.plan_date.slice(0, 7)); // tampilkan bulan plan yang baru dibuat
    plans.refetch();
    return true;
  };

  return (
    <>
      {toast && (
        <div className="sticky top-14 z-30">
          <InlineToast
            tone={toast.tone}
            onClose={() => setToast(null)}
            className={toast.tone === 'success' ? 'mx-auto w-full max-w-[230px]' : undefined}
          >
            {toast.message}
          </InlineToast>
        </div>
      )}

      <CallPlanForm
        callLists={callLists.data}
        callListsLoading={callLists.loading}
        callListsError={callLists.error}
        onRetryCallLists={callLists.refetch}
        saving={create.loading}
        serverFieldErrors={create.error?.fieldErrors ?? NO_FIELD_ERRORS}
        formError={formError}
        onDirty={create.clearError}
        onSubmit={handleCreate}
      />

      <CallPlanListSection
        plans={plans.data}
        loading={plans.loading}
        error={plans.error}
        onRetry={plans.refetch}
        thisMonth={thisMonth}
        month={month}
        onMonthChange={setMonth}
      />
    </>
  );
}
