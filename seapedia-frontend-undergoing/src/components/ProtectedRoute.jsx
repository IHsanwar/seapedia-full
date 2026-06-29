import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ requireRole = false, allowedRoles = [] }) {
  const { isAuthenticated, isLoading, activeRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Belum login → ke halaman login, simpan path asal agar bisa redirect balik setelah login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Sudah login tapi belum pilih role
  if (requireRole && (!activeRole || activeRole === 'none')) {
    return <Navigate to="/select-role" replace />;
  }

  // Sudah login, punya role, tapi bukan role yang diizinkan → halaman 403
  if (allowedRoles.length > 0 && !allowedRoles.includes(activeRole)) {
    return (
      <Navigate
        to="/unauthorized"
        state={{ from: location.pathname, requiredRoles: allowedRoles }}
        replace
      />
    );
  }

  return <Outlet />;
}

