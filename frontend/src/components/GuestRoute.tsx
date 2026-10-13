import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageLoading from './PageLoading';

// Kebalikan ProtectedRoute: halaman khusus yang belum login (mis. /login)
export default function GuestRoute() {
  const { token } = useAuth();

  if (token === undefined) return <PageLoading />;
  if (token !== null) return <Navigate to="/call-list" replace />;

  return <Outlet />;
}
