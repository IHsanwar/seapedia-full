import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ requireRole = false, allowedRoles = [] }) {
  const { isAuthenticated, isLoading, activeRole } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && (!activeRole || activeRole === 'none')) {
    return <Navigate to="/select-role" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(activeRole)) {
    const fallback = activeRole && activeRole !== 'none' ? `/${activeRole}/dashboard` : '/select-role';
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
