import { useState } from 'react';
import { CalendarDays, List } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, SectionTitle } from '../../components/ui/Card';
import Select, { type SelectOption } from '../../components/ui/Select';
import InlineAlert from '../shared/InlineAlert';
import CallPlanCard from './CallPlanCard';
import { periodLabel } from '../../lib/dateId';
import type { CallPlan } from '../../types/callPlan';

interface Props {
  plans: CallPlan[] | null; // null = belum pernah berhasil dimuat
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  thisMonth: string; // bulan berjalan, selalu ada di opsi filter
  month: string;
  onMonthChange: (month: string) => void;
}

const byDateThenTime = (a: CallPlan, b: CallPlan) =>
  a.plan_date.localeCompare(b.plan_date) || a.plan_time.localeCompare(b.plan_time);

export default function CallPlanListSection({
  plans, loading, error, onRetry, thisMonth, month, onMonthChange,
}: Props) {
  const [openId, setOpenId] = useState<number | null>(null);

  // Opsi filter: bulan yang ada pada data plan ditambah bulan berjalan
  const months = [...new Set([thisMonth, month, ...(plans ?? []).map((p) => p.plan_date.slice(0, 7))])].sort();
  const monthOptions: SelectOption[] = months.map((m) => ({ value: m, label: periodLabel(m) }));
  const visible = (plans ?? []).filter((p) => p.plan_date.startsWith(month)).sort(byDateThenTime);

  return (
    <Card>
      <SectionTitle icon={<List size={18} />}>Daftar Call Plan</SectionTitle>

      <Select
        id="plan-month"
        label="Bulan"
        leftIcon={<CalendarDays size={17} />}
        value={month}
        options={monthOptions}
        onChange={onMonthChange}
        className="flex-row! items-center gap-3!"
      />

      <div aria-busy={loading} className="mt-4">
        {error != null && (
          <div className="mb-3 flex flex-col gap-2">
            <InlineAlert>{error}</InlineAlert>
            <Button variant="outline" className="self-start text-sm!" loading={loading} onClick={onRetry}>
              Coba lagi
            </Button>
          </div>
        )}

        {plans == null ? (
          loading && (
            <p role="status" className="py-6 text-center text-sm text-gray-500">
              Memuat Call Plan...
            </p>
          )
        ) : visible.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">Belum ada Call Plan pada bulan ini</p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {visible.map((plan) => (
              <li key={plan.id}>
                <CallPlanCard
                  plan={plan}
                  open={openId === plan.id}
                  onToggle={() => setOpenId((id) => (id === plan.id ? null : plan.id))}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
