import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  CalendarPlus, ChartNoAxesColumn, ChevronDown, ClipboardCheck, LogOut, Phone, UserRound,
  type LucideIcon,
} from 'lucide-react';
import MsfLogo from '../components/MsfLogo';
import { useAuth } from '../context/AuthContext';
import { PendingApprovalProvider } from '../context/PendingApprovalContext';
import { cn } from '../lib/cn';
import { canApprove, ROLE_LABELS } from '../lib/roles';
import ApprovalBell from './ApprovalBell';

const tabs: { to: string; label: string; icon: LucideIcon; filled?: boolean }[] = [
  { to: '/call-list', label: 'Call List', icon: Phone, filled: true },
  { to: '/call-plan', label: 'Call Plan', icon: CalendarPlus },
  { to: '/call-actual', label: 'Call Actual', icon: ChartNoAxesColumn },
];

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white';

const menuItem =
  'flex min-h-11 w-full items-center gap-2.5 px-3.5 text-sm font-medium hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none disabled:opacity-60';

export default function AppLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Tutup menu akun saat klik di luar atau tekan Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      // request gagal (mis. offline): sesi di klien tetap sudah dikosongkan
    } finally {
      navigate('/login', { replace: true });
    }
  };

  return (
    <PendingApprovalProvider>
      <div className="min-h-dvh pb-[72px]">
        <header className="sticky top-0 z-40 bg-teal-700 text-white shadow-sm">
          <div className="mx-auto flex h-12 max-w-[480px] items-center justify-between pl-[18px] pr-2">
            <div className="flex items-center gap-2.5">
              <MsfLogo variant="light" className="h-7 w-7" />
              <div>
                <p className="text-[17px] font-bold leading-none">MSF</p>
                <p className="mt-0.5 text-[9.5px] font-medium leading-none text-teal-50">
                  Mobile Sales Force
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <ApprovalBell />
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label={`Menu akun ${user?.name ?? ''}`.trim()}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  className={cn('flex h-11 items-center gap-1.5 rounded-lg pl-1.5 pr-2', focusRing)}
                >
                  <span className="flex h-[30px] w-[30px] items-center justify-center overflow-hidden rounded-full border-[1.5px] border-white bg-teal-100 text-teal-700">
                    <UserRound size={18} />
                  </span>
                  <ChevronDown size={14} strokeWidth={2.5} />
                </button>

                {menuOpen && user && (
                  <div
                    role="menu"
                    aria-label="Menu akun"
                    className="absolute right-1 top-full z-50 mt-1 w-60 overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-900 shadow-lg"
                  >
                    <div className="border-b border-gray-100 px-3.5 py-3">
                      <p className="truncate text-sm font-semibold">{user.name}</p>
                      <p className="truncate text-xs text-gray-500">
                        {user.role.toUpperCase()} · {ROLE_LABELS[user.role]}
                      </p>
                    </div>
                    {canApprove(user.role) && (
                      <Link
                        to="/approval"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className={menuItem}
                      >
                        <ClipboardCheck size={17} className="text-teal-700" />
                        Persetujuan Call List
                      </Link>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className={cn(menuItem, 'text-red-600')}
                    >
                      <LogOut size={17} />
                      {loggingOut ? 'Keluar...' : 'Keluar'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-[480px] flex-col gap-4 px-[18px] py-3">
          <Outlet />
        </main>

        <nav
          aria-label="Navigasi utama"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white"
        >
          <div className="mx-auto grid h-14 max-w-[480px] grid-cols-3">
            {tabs.map(({ to, label, icon: Icon, filled }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'relative flex flex-col items-center justify-center gap-1 text-[10px] font-medium',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600',
                    isActive ? 'text-teal-700' : 'text-slate-500',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={20} fill={filled && isActive ? 'currentColor' : 'none'} />
                    {label}
                    {isActive && (
                      <span className="absolute bottom-1 h-[3px] w-20 rounded-full bg-teal-700" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </PendingApprovalProvider>
  );
}
