import { Calendar, CircleAlert, FileText, UserRound } from 'lucide-react';
import Button from '../../components/ui/Button';
import ListItemCard from '../../components/ui/ListItemCard';
import StatusBadge from '../../components/ui/StatusBadge';
import InlineAlert from '../shared/InlineAlert';
import MetaRow from '../shared/MetaRow';
import { isoDateTimeLabel, periodLabel } from '../../lib/dateId';
import type { ApprovalDecision, DecisionRecord } from '../../types/approval';

interface Props {
  decision: ApprovalDecision; // tab yang sedang ditampilkan
  records: DecisionRecord[] | null; // semua keputusan user; null = belum pernah berhasil dimuat
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const TEXT: Record<ApprovalDecision, { empty: string; when: string }> = {
  approved: { empty: 'Belum ada Call List yang disetujui', when: 'Disetujui pada' },
  rejected: { empty: 'Belum ada Call List yang ditolak', when: 'Ditolak pada' },
};

// Riwayat keputusan yang dibuat user login: kartu ringkas baca-saja, tanpa tombol aksi
export default function DecisionHistoryList({ decision, records, loading, error, onRetry }: Props) {
  const visible = (records ?? []).filter((r) => r.decision === decision);
  const text = TEXT[decision];

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

      {records == null ? (
        loading && (
          <p role="status" className="py-6 text-center text-sm text-gray-500">
            Memuat riwayat keputusan...
          </p>
        )
      ) : visible.length === 0 ? (
        <p className="rounded-xl bg-white px-4 py-8 text-center text-sm text-gray-500 shadow-sm">{text.empty}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((record) => (
            <li key={record.id}>
              <ListItemCard
                icon={<UserRound size={22} fill="currentColor" />}
                title={`${record.user.name} - ${record.user.role.toUpperCase()}`}
                badge={<StatusBadge status={record.decision} className="px-2! text-[10px]!" />}
                footer={
                  record.decision === 'rejected' &&
                  record.reason != null &&
                  record.reason !== '' && (
                    <p className="flex items-start gap-1.5 rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-[11px] text-red-700">
                      <CircleAlert size={14} className="mt-px shrink-0 fill-red-600 text-red-50" />
                      <span>
                        <span className="font-semibold">Alasan:</span> {record.reason}
                      </span>
                    </p>
                  )
                }
              >
                <div className="flex flex-col gap-1">
                  <MetaRow icon={Calendar}>{periodLabel(record.period)}</MetaRow>
                  <MetaRow icon={UserRound}>{record.doctors_count} dokter</MetaRow>
                  <MetaRow icon={FileText}>
                    {text.when} {isoDateTimeLabel(record.decided_at)}
                  </MetaRow>
                </div>
              </ListItemCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
