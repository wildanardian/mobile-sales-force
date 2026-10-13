import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import GuestRoute from './components/GuestRoute';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import { APPROVER_ROLES } from './lib/roles';
import ApprovalPage from './pages/ApprovalPage';
import CallActualPage from './pages/CallActualPage';
import CallListPage from './pages/CallListPage';
import CallPlanPage from './pages/CallPlanPage';
import LoginPage from './pages/LoginPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/call-list" element={<CallListPage />} />
            <Route path="/call-plan" element={<CallPlanPage />} />
            <Route path="/call-actual" element={<CallActualPage />} />
            <Route element={<ProtectedRoute roles={APPROVER_ROLES} />}>
              <Route path="/approval" element={<ApprovalPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/call-list" replace />} />
      </Routes>
      <Toaster position="top-center" reverseOrder={false} />
    </BrowserRouter>
  );
}
