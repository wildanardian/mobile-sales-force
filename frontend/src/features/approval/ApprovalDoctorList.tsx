import { useState } from 'react';
import { ChevronRight, Users } from 'lucide-react';
import type { ApprovalDoctor } from '../../types/approval';

const VISIBLE = 5;

export default function ApprovalDoctorList({ doctors }: { doctors: ApprovalDoctor[] }) {
  const [showAll, setShowAll] = useState(false);
  const hiddenCount = Math.max(doctors.length - VISIBLE, 0);
  const visible = showAll ? doctors : doctors.slice(0, VISIBLE);

  return (
    <div className="rounded-xl bg-teal-50/70 p-1">
      <h3 className="px-2.5 py-2 text-xs font-bold text-gray-900">Daftar Dokter</h3>

      <ol className="divide-y divide-gray-100 rounded-lg bg-white">
        {visible.map((d, i) => (
          <li key={d.id} className="grid grid-cols-[22px_1fr_1fr] items-center gap-2 px-2.5 py-2">
            <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-teal-50 text-[10.5px] font-semibold text-teal-800">
              {i + 1}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-semibold text-gray-900">{d.name}</span>
              <span className="block text-[10.5px] text-gray-500">{d.specialization}</span>
            </span>
            {/* Backend hanya punya alamat (tanpa nama RS/kota terpisah) */}
            <span className="line-clamp-2 min-w-0 text-[10.5px] leading-snug text-gray-600">{d.address}</span>
          </li>
        ))}
      </ol>

      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          aria-expanded={showAll}
          className="mt-1 flex min-h-11 w-full items-center gap-2 rounded-lg px-2.5 text-xs font-medium text-teal-800 hover:bg-teal-100/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
        >
          <Users size={15} />
          <span className="flex-1 text-left">
            {showAll ? `Sembunyikan ${hiddenCount} dokter lainnya` : `Lihat ${hiddenCount} dokter lainnya`}
          </span>
          <ChevronRight size={15} strokeWidth={2.5} className={showAll ? '-rotate-90' : undefined} />
        </button>
      )}
    </div>
  );
}
