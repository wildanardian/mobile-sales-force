import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { RoleName } from '../types/auth';
import PageLoading from './PageLoading';

interface Props {
  roles?: RoleName[]; // bila diisi, hanya role ini yang boleh masuk
}

export default function ProtectedRoute({ roles }: Props) {
  const { token, user } = useAuth();

  // undefined = sesi belum dicek: jangan redirect dulu, tunggu hasil /refresh
  if (token === undefined) return <PageLoading />;
  // null = belum login
  if (token === null || !user) return <Navigate to="/login" replace />;
  // sudah login tetapi role tidak diizinkan
  if (roles && !roles.includes(user.role)) return <Navigate to="/call-list" replace />;

  return <Outlet />;
}
