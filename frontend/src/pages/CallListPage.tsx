import { useState } from 'react';
import { Card } from '../components/ui/Card';
import CallListForm from '../features/call-list/CallListForm';
import CallListSection from '../features/call-list/CallListSection';
import InlineToast from '../features/shared/InlineToast';
import { useAuth } from '../context/AuthContext';
import { useAction } from '../hooks/useAction';
import { useFetch } from '../hooks/useFetch';
import { callListService } from '../services/callListService';
import { masterService } from '../services/masterService';
import type { CallList, CreateCallListPayload } from '../types/callList';
import type { Doctor } from '../types/master';
import type { ParsedError } from '../utils/errorMessage';

interface Toast {
  tone: 'success' | 'error';
  message: string;
}

interface Editing {
  item: CallList;
  resubmit: boolean;
}

const NO_FIELD_ERRORS: Record<string, string> = {};

// Gabungkan opsi dokter dengan dokter milik call list yang diedit,
// agar chip tetap tampil walau daftar dokter gagal dimuat
const mergeDoctors = (options: Doctor[], extra: Doctor[]) => [
  ...options,
  ...extra.filter((d) => !options.some((o) => o.id === d.id)),
];

export default function CallListPage() {
  const { user } = useAuth();
  // Dua request awal berjalan paralel; kegagalan salah satu tidak menutupi yang lain
  const callLists = useFetch(callListService.getAll);
  const doctors = useFetch(masterService.getDoctors);

  const [toast, setToast] = useState<Toast | null>(null);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);

  // 400/409: data di layar tidak lagi sinkron dengan server (bulan sudah terisi,
  // status sudah berubah), jadi daftar dimuat ulang
  const syncOnConflict = (error: ParsedError) => {
    if (error.status === 409 || error.status === 400) callLists.refetch();
  };
  // Error form: 422 tampil di bawah field, 403 sebagai toast, sisanya alert di form
  const onFormError = (error: ParsedError) => {
    syncOnConflict(error);
    if (error.status === 403) setToast({ tone: 'error', message: error.message });
  };
  // Error aksi di kartu selalu ditampilkan sebagai toast
  const onCardError = (error: ParsedError) => {
    syncOnConflict(error);
    setToast({ tone: 'error', message: error.message });
  };

  const create = useAction(callListService.create, onFormError);
  const update = useAction(callListService.update, onFormError);
  const submit = useAction(callListService.submit, onCardError);

  // Role MM tidak membuat/mengajukan Call List (backend tetap menolak dengan 403)
  const canCreate = user?.role !== 'mm';
  const formAction = editing ? update : create;
  const formStatus = formAction.error?.status;
  const formError =
    formAction.error && formStatus !== 422 && formStatus !== 403 ? formAction.error.message : null;
  const busy = create.loading || update.loading || submit.loading;

  const clearFormErrors = () => {
    create.clearError();
    update.clearError();
  };

  const handleCreate = async (payload: CreateCallListPayload) => {
    setToast(null);
    const created = await create.execute(payload);
    if (!created) return false;
    setToast({ tone: 'success', message: 'Call List berhasil dibuat' });
    callLists.refetch();
    return true;
  };

  const handleSaveEdit = async (payload: CreateCallListPayload) => {
    if (!editing) return false;
    const { item, resubmit } = editing;
    setToast(null);

    // period tidak dikirim: backend hanya menerima doctor_ids
    const updated = await update.execute(item.id, { doctor_ids: payload.doctor_ids });
    if (!updated) return false;

    if (!resubmit) {
      setToast({ tone: 'success', message: 'Call List berhasil diperbarui' });
      setEditing(null);
      callLists.refetch();
      return true;
    }

    // Langkah kedua: ajukan ulang. Bila gagal, perubahan dokter sudah tersimpan
    // dan call list tetap draft; form dibiarkan terbuka agar bisa dicoba lagi.
    const submitted = await submit.execute(item.id);
    callLists.refetch();
    if (!submitted) return false;
    setToast({ tone: 'success', message: 'Call List berhasil diajukan' });
    setEditing(null);
    return true;
  };

  const handleSubmit = async (item: CallList) => {
    setToast(null);
    setSubmittingId(item.id);
    const submitted = await submit.execute(item.id);
    setSubmittingId(null);
    if (!submitted) return;
    setToast({ tone: 'success', message: 'Call List berhasil diajukan' });
    callLists.refetch();
  };

  const handleEdit = (item: CallList, resubmit: boolean) => {
    clearFormErrors();
    setToast(null);
    setEditing({ item, resubmit });
    window.scrollTo({ top: 0, behavior: 'smooth' }); // form ada di bagian atas halaman
  };

  const handleCancelEdit = () => {
    clearFormErrors();
    setEditing(null);
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

      {canCreate ? (
        <CallListForm
          // key berbeda me-reset isi form saat berpindah antara buat baru dan edit
          key={editing ? `edit-${editing.item.id}` : 'create'}
          editing={
            editing
              ? {
                  period: editing.item.period,
                  doctorIds: editing.item.doctors.map((d) => d.id),
                  resubmit: editing.resubmit,
                }
              : undefined
          }
          onCancelEdit={handleCancelEdit}
          doctors={mergeDoctors(doctors.data ?? [], editing?.item.doctors ?? [])}
          doctorsLoading={doctors.loading}
          doctorsError={doctors.error}
          onRetryDoctors={doctors.refetch}
          takenPeriods={(callLists.data ?? []).map((c) => c.period)}
          saving={formAction.loading || (editing != null && submit.loading)}
          serverFieldErrors={formAction.error?.fieldErrors ?? NO_FIELD_ERRORS}
          formError={formError}
          onDirty={clearFormErrors}
          onSubmit={editing ? handleSaveEdit : handleCreate}
        />
      ) : (
        <Card>
          <p className="text-sm text-gray-600">Role Anda tidak membuat Call List</p>
        </Card>
      )}

      <CallListSection
        callLists={callLists.data}
        loading={callLists.loading}
        error={callLists.error}
        onRetry={callLists.refetch}
        canSubmit={canCreate}
        busy={busy}
        submittingId={submittingId}
        detailId={detailId}
        onSubmit={handleSubmit}
        onEdit={handleEdit}
        onToggleDetail={(item) => setDetailId((id) => (id === item.id ? null : item.id))}
      />
    </>
  );
}
