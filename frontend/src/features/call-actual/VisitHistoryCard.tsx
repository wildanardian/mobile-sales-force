import { Calendar, ChevronDown, ChevronRight, Clock, Package, Stethoscope } from 'lucide-react';
import ListItemCard from '../../components/ui/ListItemCard';
import StatusBadge from '../../components/ui/StatusBadge';
import MetaRow from '../shared/MetaRow';
import VisitThumb from './VisitThumb';
import { dateLabel } from '../../lib/dateId';
import type { CallActual } from '../../types/callActual';

const badgeClass = 'px-2! text-[10px]!';

interface Props {
  visit: CallActual;
  open: boolean;
  onToggle: () => void;
}

export default function VisitHistoryCard({ visit, open, onToggle }: Props) {
  const panelId = `visit-detail-${visit.id}`;
  const Chevron = open ? ChevronDown : ChevronRight;

  return (
    <ListItemCard
      icon={<Stethoscope size={20} />}
      title={visit.doctor.name}
      // Kunjungan dikirim sekali setelah selesai, jadi selalu Completed
      badge={<StatusBadge status="completed" className={badgeClass} />}
      action={
        <span className="flex items-center">
          <StatusBadge status={visit.visit_type} className={badgeClass} />
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={`${open ? 'Tutup' : 'Buka'} detail kunjungan ${visit.doctor.name}`}
            className="-mr-2 flex h-11 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            <Chevron size={16} strokeWidth={2.5} />
          </button>
        </span>
      }
      footer={
        open && (
          <div id={panelId} className="flex flex-col gap-3 rounded-xl bg-teal-50/70 p-3">
            <div className="grid grid-cols-2 gap-2.5">
              <figure>
                <VisitThumb src={visit.photo_url} alt="Foto kunjungan" className="h-24 w-full" />
                <figcaption className="mt-1 text-[10.5px] text-gray-500">Foto</figcaption>
              </figure>
              <figure>
                <VisitThumb src={visit.signature_url} alt="Tanda tangan" className="h-24 w-full" />
                <figcaption className="mt-1 text-[10.5px] text-gray-500">Tanda tangan</figcaption>
              </figure>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900">Produk di-detailing ({visit.products.length})</h3>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {visit.products.map((p) => (
                  <li key={p.id} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-teal-800">
                    {p.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )
      }
    >
      <div className="flex flex-col gap-1">
        <MetaRow icon={Calendar}>{dateLabel(visit.visit_date)}</MetaRow>
        <MetaRow icon={Clock}>
          Check-in {visit.check_in.slice(0, 5)} · Check-out {visit.check_out.slice(0, 5)}
        </MetaRow>
        <MetaRow icon={Package}>{visit.products.length} produk di-detailing</MetaRow>
      </div>
    </ListItemCard>
  );
}
