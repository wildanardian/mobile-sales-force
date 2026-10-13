import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { canApprove } from '../lib/roles';
import { callListService } from '../services/callListService';

interface PendingApprovalValue {
  count: number | null; // null = bukan approver, belum dimuat, atau gagal dimuat
  refresh: () => void;
}

const PendingApprovalContext = createContext<PendingApprovalValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function usePendingApproval() {
  const ctx = useContext(PendingApprovalContext);
  if (!ctx) throw new Error('usePendingApproval harus dipakai di dalam PendingApprovalProvider');
  return ctx;
}

// Jumlah antrean persetujuan untuk lonceng di header. Dipasang di AppLayout, yang hanya
// dirender di dalam ProtectedRoute, jadi request baru berjalan setelah token tersedia.
export function PendingApprovalProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const enabled = user != null && canApprove(user.role);
  const [count, setCount] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    callListService
      .getPendingApproval()
      .then((queue) => {
        if (!cancelled) setCount(queue.length);
      })
      .catch(() => {
        // gagal memuat: cukup sembunyikan badge, tanpa pesan error
        if (!cancelled) setCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, reloadKey]);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  const value = useMemo<PendingApprovalValue>(
    () => ({ count: enabled ? count : null, refresh }),
    [enabled, count, refresh],
  );

  return <PendingApprovalContext.Provider value={value}>{children}</PendingApprovalContext.Provider>;
}
