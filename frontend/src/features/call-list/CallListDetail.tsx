import { useCallback } from 'react';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import InlineAlert from '../shared/InlineAlert';
import { useFetch } from '../../hooks/useFetch';
import { isoDateTimeLabel } from '../../lib/dateId';
import { callListService } from '../../services/callListService';
import type { CallList } from '../../types/callList';

// Daftar dokter diambil dari data daftar (langsung tampil);
// riwayat keputusan hanya ada di GET /call-lists/{id}.
export default function CallListDetail({ item, panelId }: { item: CallList; panelId: string }) {
  const fetcher = useCallback(() => callListService.getById(item.id), [item.id]);
  const detail = useFetch(fetcher);
  const approvals = detail.data?.approvals ?? [];

  return (
    <div id={panelId} className="flex flex-col gap-3 rounded-xl bg-teal-50/70 p-3">
      <div>
        <h3 className="text-xs font-bold text-gray-900">Daftar Dokter ({item.doctors.length})</h3>
        <ol className="mt-1.5 divide-y divide-gray-100 rounded-lg bg-white">
          {item.doctors.map((d, i) => (
            <li key={d.id} className="flex items-center gap-2 px-2.5 py-2">
              <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-teal-50 text-[10.5px] font-semibold text-teal-800">
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold text-gray-900">{d.name}</span>
                <span className="block text-[10.5px] text-gray-500">{d.specialization}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div aria-busy={detail.loading}>
        <h3 className="text-xs font-bold text-gray-900">Riwayat Keputusan</h3>
        {detail.error != null ? (
          <div className="mt-1.5 flex flex-col gap-2">
            <InlineAlert>{detail.error}</InlineAlert>
            <Button variant="outline" className="self-start text-sm!" loading={detail.loading} onClick={detail.refetch}>
              Coba lagi
            </Button>
          </div>
        ) : detail.data == null ? (
          <p role="status" className="mt-1.5 text-xs text-gray-500">
            Memuat riwayat...
          </p>
        ) : approvals.length === 0 ? (
          <p className="mt-1.5 text-xs text-gray-500">Belum ada keputusan.</p>
        ) : (
          <ul className="mt-1.5 flex flex-col gap-1.5">
            {approvals.map((a) => (
              <li key={`${a.decided_at}-${a.decision}`} className="rounded-lg bg-white px-2.5 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-xs font-semibold text-gray-900">
                    {a.approver_name ?? 'Atasan'}
                  </span>
                  <StatusBadge status={a.decision} className="px-2! text-[10px]!" />
                </div>
                <p className="text-[10.5px] text-gray-500">{isoDateTimeLabel(a.decided_at)}</p>
                {a.reason != null && a.reason !== '' && (
                  <p className="mt-1 text-[11px] text-gray-700">
                    <span className="font-semibold">Alasan:</span> {a.reason}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
