import { useState } from 'react';
import Button from '../../components/ui/Button';
import InlineAlert from '../shared/InlineAlert';
import ApprovalCard from './ApprovalCard';
import ConfirmDialog from './ConfirmDialog';
import { periodLabel } from '../../lib/dateId';
import type { ApprovalDecision, PendingCallList } from '../../types/approval';

interface Deciding {
  id: number;
  decision: ApprovalDecision;
}

interface Props {
  requests: PendingCallList[] | null; // null = belum pernah berhasil dimuat
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  now: number;
  deciding: Deciding | null; // keputusan yang sedang dikirim
  serverReasonError: { id: number; message: string } | null; // 422 untuk field reason
  onClearServerError: () => void;
  // true = keputusan tersimpan
  onDecide: (request: PendingCallList, decision: ApprovalDecision, reason: string) => Promise<boolean>;
}

export default function PendingApprovalList({
  requests, loading, error, onRetry, now, deciding, serverReasonError, onClearServerError, onDecide,
}: Props) {
  // Accordion: hanya satu kartu terbuka sekaligus
  const [openId, setOpenId] = useState<number | null>(null);
  // Alasan disimpan per kartu, jadi tidak terbawa ke kartu lain saat accordion berpindah
  const [reasons, setReasons] = useState<Record<number, string>>({});
  const [missingReasonId, setMissingReasonId] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<{ request: PendingCallList; decision: ApprovalDecision } | null>(null);

  const reasonOf = (id: number) => reasons[id] ?? '';

  const handleReasonChange = (id: number, reason: string) => {
    setReasons((r) => ({ ...r, [id]: reason }));
    setMissingReasonId(null);
    onClearServerError();
  };

  const askReject = (request: PendingCallList) => {
    // Alasan kosong atau hanya spasi: tidak ada request yang dikirim
    if (reasonOf(request.id).trim() === '') {
      setMissingReasonId(request.id);
      return;
    }
    setConfirm({ request, decision: 'rejected' });
  };

  const handleConfirm = async () => {
    if (!confirm || deciding) return;
    const { request, decision } = confirm;
    setConfirm(null);
    const saved = await onDecide(request, decision, reasonOf(request.id).trim());
    if (saved) {
      // Kartu akan hilang dari antrean: tutup panel dan buang alasannya
      setOpenId(null);
      setReasons((r) => Object.fromEntries(Object.entries(r).filter(([id]) => Number(id) !== request.id)));
    }
  };

  const reasonError = (id: number) => {
    if (missingReasonId === id) return 'Alasan wajib diisi saat reject';
    return serverReasonError?.id === id ? serverReasonError.message : undefined;
  };

  const confirmName = confirm ? `${confirm.request.user.name} - ${periodLabel(confirm.request.period)}` : '';

  return (
    <div aria-busy={loading} className="flex flex-col gap-3">
      {error != null && (
        <div className="flex flex-col gap-2">
          <InlineAlert>{error}</InlineAlert>
          <Button variant="outline" className="self-start text-sm!" loading={loading} onClick={onRetry}>
            Coba lagi
          </Button>
        </div>
      )}

      {requests == null ? (
        loading && (
          <p role="status" className="py-6 text-center text-sm text-gray-500">
            Memuat antrean persetujuan...
          </p>
        )
      ) : requests.length === 0 ? (
        <p className="rounded-xl bg-white px-4 py-8 text-center text-sm text-gray-500 shadow-sm">
          Tidak ada Call List yang menunggu persetujuan
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {requests.map((request) => (
            <li key={request.id}>
              <ApprovalCard
                request={request}
                now={now}
                open={openId === request.id}
                onToggle={() => setOpenId((id) => (id === request.id ? null : request.id))}
                reason={reasonOf(request.id)}
                onReasonChange={(reason) => handleReasonChange(request.id, reason)}
                reasonError={reasonError(request.id)}
                busy={deciding != null}
                loadingDecision={deciding?.id === request.id ? deciding.decision : null}
                onApprove={() => setConfirm({ request, decision: 'approved' })}
                onReject={() => askReject(request)}
              />
            </li>
          ))}
        </ul>
      )}

      {confirm &&
        (confirm.decision === 'approved' ? (
          <ConfirmDialog
            title={`Setujui Call List ${confirmName}?`}
            confirmLabel="Ya, Setujui"
            tone="primary"
            onConfirm={handleConfirm}
            onCancel={() => setConfirm(null)}
          />
        ) : (
          <ConfirmDialog
            title={`Tolak Call List ${confirmName}?`}
            description="Call List akan dikembalikan ke pengaju sebagai draft."
            confirmLabel="Ya, Tolak"
            tone="danger"
            onConfirm={handleConfirm}
            onCancel={() => setConfirm(null)}
          />
        ))}
    </div>
  );
}
