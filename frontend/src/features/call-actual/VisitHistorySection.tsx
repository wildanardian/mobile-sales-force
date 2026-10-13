import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import Button from '../../components/ui/Button';
import { SectionTitle } from '../../components/ui/Card';
import Select, { type SelectOption } from '../../components/ui/Select';
import InlineAlert from '../shared/InlineAlert';
import VisitHistoryCard from './VisitHistoryCard';
import { periodLabel } from '../../lib/dateId';
import type { CallActual } from '../../types/callActual';

interface Props {
  visits: CallActual[] | null; // null = belum pernah berhasil dimuat
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  thisMonth: string; // bulan berjalan, selalu ada di opsi filter
  month: string;
  onMonthChange: (month: string) => void;
}

const newestFirst = (a: CallActual, b: CallActual) =>
  b.visit_date.localeCompare(a.visit_date) || b.check_in.localeCompare(a.check_in);

export default function VisitHistorySection({
  visits, loading, error, onRetry, thisMonth, month, onMonthChange,
}: Props) {
  const [openId, setOpenId] = useState<number | null>(null);

  // Opsi filter: bulan yang ada pada data ditambah bulan berjalan
  const months = [...new Set([thisMonth, month, ...(visits ?? []).map((v) => v.visit_date.slice(0, 7))])].sort();
  const monthOptions: SelectOption[] = months.map((m) => ({ value: m, label: periodLabel(m) }));
  const visible = (visits ?? []).filter((v) => v.visit_date.startsWith(month)).sort(newestFirst);

  return (
    <section aria-labelledby="visit-history" aria-busy={loading} className="mt-2">
      <div id="visit-history">
        <SectionTitle>Riwayat Kunjungan</SectionTitle>
      </div>

      <Select
        id="visit-month"
        label="Bulan"
        leftIcon={<CalendarDays size={17} />}
        value={month}
        options={monthOptions}
        onChange={onMonthChange}
        className="mb-3 flex-row! items-center gap-3!"
      />

      {error != null && (
        <div className="mb-3 flex flex-col gap-2">
          <InlineAlert>{error}</InlineAlert>
          <Button variant="outline" className="self-start text-sm!" loading={loading} onClick={onRetry}>
            Coba lagi
          </Button>
        </div>
      )}

      {visits == null ? (
        loading && (
          <p role="status" className="py-6 text-center text-sm text-gray-500">
            Memuat riwayat kunjungan...
          </p>
        )
      ) : visible.length === 0 ? (
        <p className="rounded-xl bg-white px-4 py-8 text-center text-sm text-gray-500 shadow-sm">
          Belum ada kunjungan pada bulan ini
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((visit) => (
            <li key={visit.id}>
              <VisitHistoryCard
                visit={visit}
                open={openId === visit.id}
                onToggle={() => setOpenId((id) => (id === visit.id ? null : visit.id))}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
