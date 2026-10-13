import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import DecisionHistoryList from '../features/approval/DecisionHistoryList';
import PendingApprovalList from '../features/approval/PendingApprovalList';
import InlineToast from '../features/shared/InlineToast';
import { usePendingApproval } from '../context/PendingApprovalContext';
import SegmentedControl, { type Segment } from '../features/shared/SegmentedControl';
import { useAction } from '../hooks/useAction';
import { useFetch } from '../hooks/useFetch';
import { callListService } from '../services/callListService';
import type { ApprovalDecision, ApprovalTab, PendingCallList } from '../types/approval';
import type { DecideCallListPayload } from '../types/callList';

interface Toast {
  tone: 'success' | 'error';
  message: string;
}

// Status yang berarti antrean di layar sudah tidak sesuai server:
// 403 bukan atasan langsung, 400/409 sudah diputuskan, 404 call list tidak ada
const STALE_QUEUE_STATUSES = [400, 403, 404, 409];

export default function ApprovalPage() {
  const navigate = useNavigate();
  // Backend yang menyaring antrean (bawahan langsung user login); tidak disaring ulang di sini
  const queue = useFetch(callListService.getPendingApproval);
  // Riwayat dimuat paralel dengan antrean; kegagalannya tidak menutupi antrean
  const decisions = useFetch(callListService.getDecisions);
  const { refresh: refreshBell } = usePendingApproval();
  const [tab, setTab] = useState<ApprovalTab>('pending');
  const [now] = useState(() => Date.now());
  const [toast, setToast] = useState<Toast | null>(null);
  const [deciding, setDeciding] = useState<{ id: number; decision: ApprovalDecision } | null>(null);
  const [lastDecidedId, setLastDecidedId] = useState<number | null>(null);

  const decide = useAction(callListService.decide, (error) => {
    // 422 untuk `reason` tampil di bawah textarea; error lain sebagai toast merah
    if (!(error.status === 422 && error.fieldErrors.reason != null)) {
      setToast({ tone: 'error', message: error.message });
    }
    if (error.status != null && STALE_QUEUE_STATUSES.includes(error.status)) queue.refetch();
  });

  const serverReasonError =
    decide.error?.status === 422 && decide.error.fieldErrors.reason != null && lastDecidedId != null
      ? { id: lastDecidedId, message: decide.error.fieldErrors.reason }
      : null;

  const handleDecide = async (request: PendingCallList, decision: ApprovalDecision, reason: string) => {
    setToast(null);
    setDeciding({ id: request.id, decision });
    setLastDecidedId(request.id);
    // Alasan hanya dikirim saat reject
    const payload: DecideCallListPayload = decision === 'rejected' ? { status: decision, reason } : { status: decision };
    const result = await decide.execute(request.id, payload);
    setDeciding(null);
    if (!result) return false;

    setToast({
      tone: 'success',
      // Reject mengembalikan call list ke draft agar pengaju bisa merevisi dan mengajukan ulang
      message: decision === 'approved' ? 'Call List disetujui' : 'Call List dikembalikan ke pengaju (draft)',
    });
    queue.refetch();
    decisions.refetch(); // hitungan dan isi tab Disetujui/Ditolak ikut berubah
    refreshBell(); // angka di lonceng header
    return true;
  };

  // Hitungan hanya tampil bila datanya sudah dimuat dari backend
  const countDecisions = (decision: ApprovalDecision) =>
    decisions.data?.filter((d) => d.decision === decision).length;

  const tabs: Segment<ApprovalTab>[] = [
    { value: 'pending', label: 'Menunggu Persetujuan', count: queue.data?.length },
    { value: 'approved', label: 'Disetujui', count: countDecisions('approved') },
    { value: 'rejected', label: 'Ditolak', count: countDecisions('rejected') },
  ];

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => navigate('/call-list')}
          aria-label="Kembali ke Call List"
          className="-ml-2.5 flex h-11 w-11 items-center justify-center rounded-lg text-gray-800 hover:bg-teal-100/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Persetujuan Call List</h1>
      </div>

      <SegmentedControl label="Status persetujuan" segments={tabs} value={tab} onChange={setTab} equal={false} />

      {tab === 'pending' ? (
        <PendingApprovalList
          requests={queue.data}
          loading={queue.loading}
          error={queue.error}
          onRetry={queue.refetch}
          now={now}
          deciding={deciding}
          serverReasonError={serverReasonError}
          onClearServerError={decide.clearError}
          onDecide={handleDecide}
        />
      ) : (
        <DecisionHistoryList
          decision={tab}
          records={decisions.data}
          loading={decisions.loading}
          error={decisions.error}
          onRetry={decisions.refetch}
        />
      )}

      {toast && (
        <>
          {/* ruang kosong agar toast yang menempel di bawah tidak menutupi konten terakhir */}
          <div aria-hidden="true" className="h-12" />
          <div className="fixed inset-x-0 bottom-[66px] z-30 px-[18px]">
            <InlineToast tone={toast.tone} onClose={() => setToast(null)} className="mx-auto max-w-[444px] shadow-md">
              {toast.message}
            </InlineToast>
          </div>
        </>
      )}
    </>
  );
}
