import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePendingApproval } from '../context/PendingApprovalContext';
import { canApprove } from '../lib/roles';

// Lonceng di header: indikator antrean persetujuan, hanya untuk role yang punya bawahan
export default function ApprovalBell() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { count } = usePendingApproval();

  if (!user || !canApprove(user.role)) return null;

  const pending = count ?? 0;

  return (
    <button
      type="button"
      onClick={() => navigate('/approval')}
      aria-label={`Persetujuan menunggu: ${pending}`}
      className="relative flex h-11 w-11 items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      <Bell size={19} />
      {pending > 0 && (
        <span
          aria-hidden="true"
          className="absolute right-[5px] top-[5px] flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white ring-1 ring-teal-700"
        >
          {pending > 99 ? '99+' : pending}
        </span>
      )}
    </button>
  );
}
