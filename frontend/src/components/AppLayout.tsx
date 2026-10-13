import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, CalendarDays, ClipboardCheck, LogOut, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/cn';

const tabs = [
  { to: '/call-lists', label: 'Call List', icon: Phone },
  { to: '/call-plans', label: 'Call Plan', icon: CalendarDays },
  { to: '/call-actuals', label: 'Call Actual', icon: BarChart3 },
];

export default function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 bg-teal-800 text-white">
        <div className="mx-auto flex h-14 max-w-screen-md items-center justify-between px-4">
          <div className="leading-tight">
            <p className="text-lg font-bold">MSF</p>
            <p className="text-[11px] text-teal-100">
              {user?.name} · {user?.role.toUpperCase()}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {user?.role !== 'mr' && (
              <NavLink
                to="/approvals"
                className="flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold hover:bg-teal-700"
              >
                <ClipboardCheck size={18} /> Persetujuan
              </NavLink>
            )}
            <button
              onClick={logout}
              aria-label="Logout"
              className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-teal-700"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-screen-md flex-col gap-4 px-4 py-4">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-white">
        <div className="mx-auto grid max-w-screen-md grid-cols-3">
          {tabs.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex h-16 flex-col items-center justify-center gap-1 text-xs font-semibold',
                  isActive ? 'text-teal-700' : 'text-gray-400',
                )
              }
            >
              <Icon size={22} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}