import { Building2, TrendingUp, User, Users, type LucideIcon } from 'lucide-react';
import type { DemoAccount, RoleName } from '../../types/msf';
import { cn } from '../../lib/cn';

const icons: Record<RoleName, LucideIcon> = {
  mr: User,
  dm: Users,
  rsm: TrendingUp,
  mm: Building2,
};

// Referensi memakai ikon solid untuk MR dan DM
const filled: Record<RoleName, boolean> = { mr: true, dm: true, rsm: false, mm: false };

interface Props {
  account: DemoAccount;
  selected: boolean;
  onSelect: (account: DemoAccount) => void;
}

export default function DemoRoleCard({ account, selected, onSelect }: Props) {
  const Icon = icons[account.role];
  const words = account.title.split(' ');
  const lastWord = words.pop();

  return (
    <button
      type="button"
      onClick={() => onSelect(account)}
      aria-pressed={selected}
      aria-label={`Akun demo ${account.code}, ${account.title}`}
      className={cn(
        'flex min-h-[84px] flex-col items-center rounded-lg border px-1 pb-2 pt-2.5 text-center transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600',
        selected
          ? 'border-teal-600 bg-teal-100/70'
          : 'border-teal-100 bg-teal-50/70 hover:bg-teal-100/60',
      )}
    >
      <Icon
        size={20}
        strokeWidth={2.5}
        fill={filled[account.role] ? 'currentColor' : 'none'}
        className="text-teal-700"
      />
      <span className="mt-1.5 text-[10px] font-bold leading-none text-teal-700">{account.code}</span>
      <span className="mt-1.5 text-[8px] leading-[1.15] text-slate-500">
        ({words.join(' ')}
        <br />
        {lastWord})
      </span>
    </button>
  );
}
