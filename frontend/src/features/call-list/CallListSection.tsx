import { List } from 'lucide-react';
import Button from '../../components/ui/Button';
import { SectionTitle } from '../../components/ui/Card';
import InlineAlert from '../shared/InlineAlert';
import CallListCard from './CallListCard';
import type { CallList } from '../../types/callList';

interface Props {
  callLists: CallList[] | null; // null = belum pernah berhasil dimuat
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  canSubmit: boolean;
  busy: boolean;
  submittingId: number | null;
  detailId: number | null; // hanya satu detail yang terbuka
  onSubmit: (item: CallList) => void;
  onEdit: (item: CallList, resubmit: boolean) => void;
  onToggleDetail: (item: CallList) => void;
}

export default function CallListSection({
  callLists, loading, error, onRetry,
  canSubmit, busy, submittingId, detailId, onSubmit, onEdit, onToggleDetail,
}: Props) {
  return (
    <section aria-labelledby="my-call-lists" aria-busy={loading} className="mt-2">
      <div id="my-call-lists">
        <SectionTitle icon={<List size={18} />}>Daftar Call List Saya</SectionTitle>
      </div>

      {error != null && (
        <div className="mb-3 flex flex-col gap-2">
          <InlineAlert>{error}</InlineAlert>
          <Button variant="outline" className="self-start text-sm!" loading={loading} onClick={onRetry}>
            Coba lagi
          </Button>
        </div>
      )}

      {callLists == null ? (
        loading && (
          <p role="status" className="py-6 text-center text-sm text-gray-500">
            Memuat Call List...
          </p>
        )
      ) : callLists.length === 0 ? (
        <p className="rounded-xl bg-white px-4 py-8 text-center text-sm text-gray-500 shadow-sm">
          Belum ada Call List
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {callLists.map((item) => (
            <li key={item.id}>
              <CallListCard
                item={item}
                canSubmit={canSubmit}
                busy={busy}
                submitting={submittingId === item.id}
                detailOpen={detailId === item.id}
                onSubmit={onSubmit}
                onEdit={onEdit}
                onToggleDetail={onToggleDetail}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
