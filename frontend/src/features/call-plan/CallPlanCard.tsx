import { ChevronDown, ChevronRight, Clock, Stethoscope, UserRound } from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import { dateLabel, dayOfMonth, monthYearLabel, periodLabel } from '../../lib/dateId';
import type { CallPlan } from '../../types/callPlan';

interface Props {
  plan: CallPlan;
  open: boolean;
  onToggle: () => void;
}

// Kartu khusus: ui/ListItemCard tidak punya slot blok tanggal dan baris berikon
export default function CallPlanCard({ plan, open, onToggle }: Props) {
  const time = plan.plan_time.slice(0, 5); // backend bisa mengirim 'HH:mm:ss'
  const panelId = `call-plan-detail-${plan.id}`;
  const Chevron = open ? ChevronDown : ChevronRight;

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Call plan ${dateLabel(plan.plan_date)} pukul ${time}, ${plan.doctor.name}`}
        className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-left hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
      >
        <span className="flex h-[52px] w-[52px] shrink-0 flex-col items-center justify-center rounded-lg bg-teal-50 text-teal-700">
          <span className="text-xl font-bold leading-none">{dayOfMonth(plan.plan_date)}</span>
          <span className="mt-1 text-[9.5px] font-medium leading-none">{monthYearLabel(plan.plan_date)}</span>
        </span>

        <span className="h-[52px] w-px shrink-0 bg-gray-200" />

        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex items-center gap-2 text-[11px] text-gray-700">
            <Clock size={13} className="shrink-0 text-gray-500" />
            <span className="flex-1">{time}</span>
            <StatusBadge status={plan.status} className="px-2! text-[10px]!" />
          </span>
          <span className="flex items-center gap-2 text-xs font-semibold text-gray-900">
            <UserRound size={13} className="shrink-0 text-gray-500" />
            <span className="truncate">{plan.doctor.name}</span>
          </span>
          <span className="flex items-start gap-2 text-[11px] text-gray-500">
            <Stethoscope size={13} className="mt-px shrink-0" />
            Spesialis {plan.doctor.specialization}
          </span>
        </span>

        <Chevron size={16} strokeWidth={2.5} className="shrink-0 text-teal-700" />
      </button>

      {open && (
        <dl id={panelId} className="mx-2.5 mb-2.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 rounded-lg bg-teal-50/70 px-3 py-2.5 text-xs">
          <dt className="text-gray-500">Call List</dt>
          {/* Tanggal plan selalu berada di bulan Call List-nya (aturan backend) */}
          <dd className="font-medium text-gray-900">{periodLabel(plan.plan_date.slice(0, 7))}</dd>
          <dt className="text-gray-500">Dokter</dt>
          <dd className="font-medium text-gray-900">{plan.doctor.name}</dd>
          <dt className="text-gray-500">Spesialisasi</dt>
          <dd className="font-medium text-gray-900">{plan.doctor.specialization}</dd>
          <dt className="text-gray-500">Jadwal</dt>
          <dd className="font-medium text-gray-900">
            {dateLabel(plan.plan_date)}, {time}
          </dd>
        </dl>
      )}
    </div>
  );
}
