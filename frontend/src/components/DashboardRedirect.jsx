import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardRedirect() {
  const { activeRole, roles } = useAuth();

  if (roles.includes('admin')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (!activeRole || activeRole === 'none') {
    return <Navigate to="/select-role" replace />;
  }

  return <Navigate to={`/${activeRole}/dashboard`} replace />;
}
