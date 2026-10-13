import { CalendarDays, CircleAlert } from 'lucide-react';
import Button from '../../components/ui/Button';
import ListItemCard from '../../components/ui/ListItemCard';
import StatusBadge from '../../components/ui/StatusBadge';
import CallListDetail from './CallListDetail';
import { isoDateTimeLabel, periodLabel } from '../../lib/dateId';
import type { CallList, CallListStatus } from '../../types/callList';

const actionClass = 'min-w-[92px] px-2.5! text-xs!';
const pairClass = 'px-3! text-xs!';

interface Props {
  item: CallList;
  canSubmit: boolean; // false untuk role yang tidak mengajukan (mm)
  busy: boolean; // ada aksi lain yang sedang berjalan: kunci tombol
  submitting: boolean; // kartu ini sedang diajukan
  detailOpen: boolean;
  onSubmit: (item: CallList) => void;
  onEdit: (item: CallList, resubmit: boolean) => void;
  onToggleDetail: (item: CallList) => void;
}

// Di database call list yang ditolak kembali berstatus 'draft'.
// Tampilan "Rejected" diturunkan dari draft yang punya last_rejection.
const displayStatus = (item: CallList): CallListStatus =>
  item.status === 'draft' && item.last_rejection ? 'rejected' : item.status;

export default function CallListCard({
  item, canSubmit, busy, submitting, detailOpen, onSubmit, onEdit, onToggleDetail,
}: Props) {
  const status = displayStatus(item);
  const rejection = status === 'rejected' ? item.last_rejection : null;
  const panelId = `call-list-detail-${item.id}`;

  let action;
  if (status === 'rejected') {
    action = (
      <Button className={actionClass} disabled={busy} onClick={() => onEdit(item, true)}>
        Edit &amp; Submit Ulang
      </Button>
    );
  } else if (status === 'draft') {
    action = (
      <span className="flex gap-1.5">
        <Button variant="outline" className={pairClass} disabled={busy} onClick={() => onEdit(item, false)}>
          Edit
        </Button>
        {canSubmit && (
          <Button
            variant="outline"
            className={pairClass}
            loading={submitting}
            disabled={busy}
            onClick={() => onSubmit(item)}
          >
            Submit
          </Button>
        )}
      </span>
    );
  } else {
    // pending_approval / submitted / approved: terkunci, hanya bisa dilihat
    action = (
      <Button
        variant="outline"
        className={actionClass}
        aria-expanded={detailOpen}
        aria-controls={panelId}
        onClick={() => onToggleDetail(item)}
      >
        {detailOpen ? 'Tutup Detail' : 'Lihat Detail'}
      </Button>
    );
  }

  let footer;
  if (rejection) {
    footer = (
      <p className="flex items-start gap-1.5 rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-[11px] text-red-700">
        <CircleAlert size={14} className="mt-px shrink-0 fill-red-600 text-red-50" />
        <span>
          <span className="font-semibold">Alasan:</span> {rejection.reason}
        </span>
      </p>
    );
  } else if (detailOpen) {
    footer = <CallListDetail item={item} panelId={panelId} />;
  }

  return (
    <ListItemCard
      icon={<CalendarDays size={20} />}
      title={periodLabel(item.period)}
      subtitle={`${item.doctors.length} dokter`}
      badge={<StatusBadge status={status} className="px-2! text-[10px]!" />}
      action={action}
      footer={footer}
    >
      <p className="text-[10.5px]">
        {rejection
          ? `Ditolak pada ${isoDateTimeLabel(rejection.decided_at)}`
          : `Dibuat pada ${isoDateTimeLabel(item.created_at)}`}
      </p>
    </ListItemCard>
  );
}
