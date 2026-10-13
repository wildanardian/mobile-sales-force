import { Calendar, ChevronRight, ChevronUp, FileText, Hourglass, UserRound } from 'lucide-react';
import ListItemCard from '../../components/ui/ListItemCard';
import StatusBadge from '../../components/ui/StatusBadge';
import MetaRow from '../shared/MetaRow';
import ApprovalDecisionForm from './ApprovalDecisionForm';
import ApprovalDoctorList from './ApprovalDoctorList';
import { isoDateTimeLabel, periodLabel } from '../../lib/dateId';
import type { ApprovalDecision, PendingCallList } from '../../types/approval';

const DAY_MS = 24 * 60 * 60 * 1000;

interface Props {
  request: PendingCallList;
  now: number; // waktu halaman dimuat (ms), untuk menghitung lama menunggu
  open: boolean;
  onToggle: () => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  reasonError?: string;
  busy: boolean;
  loadingDecision: ApprovalDecision | null;
  onApprove: () => void;
  onReject: () => void;
}

export default function ApprovalCard({
  request, now, open, onToggle,
  reason, onReasonChange, reasonError, busy, loadingDecision, onApprove, onReject,
}: Props) {
  const title = `${request.user.name} - ${request.user.role.toUpperCase()}`;
  const panelId = `approval-panel-${request.id}`;
  const Chevron = open ? ChevronUp : ChevronRight;
  const waitingDays =
    request.submitted_at != null ? Math.floor((now - new Date(request.submitted_at).getTime()) / DAY_MS) : 0;

  return (
    <ListItemCard
      icon={<UserRound size={22} fill="currentColor" />}
      title={title}
      badge={<StatusBadge status="pending_approval" className="px-2! text-[10px]!" />}
      action={
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`${open ? 'Tutup' : 'Buka'} detail pengajuan ${request.user.name}`}
          className="-mr-1.5 flex h-11 w-11 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
        >
          <Chevron size={18} strokeWidth={2.5} />
        </button>
      }
      footer={
        open && (
          <div id={panelId} className="flex flex-col gap-3 pt-1">
            <ApprovalDoctorList doctors={request.doctors} />
            <ApprovalDecisionForm
              fieldId={`approval-reason-${request.id}`}
              reason={reason}
              onReasonChange={onReasonChange}
              error={reasonError}
              busy={busy}
              loadingDecision={loadingDecision}
              onApprove={onApprove}
              onReject={onReject}
            />
          </div>
        )
      }
    >
      <div className="flex flex-col gap-1">
        <MetaRow icon={Calendar}>{periodLabel(request.period)}</MetaRow>
        <MetaRow icon={UserRound}>{request.doctors.length} dokter</MetaRow>
        {request.submitted_at != null && (
          <MetaRow icon={FileText}>Diajukan pada {isoDateTimeLabel(request.submitted_at)}</MetaRow>
        )}
        {waitingDays >= 1 && (
          <p className="flex items-center gap-1.5 text-[10.5px] font-semibold text-amber-700">
            <Hourglass size={13} className="shrink-0" />
            {waitingDays} hari menunggu
          </p>
        )}
      </div>
    </ListItemCard>
  );
}
