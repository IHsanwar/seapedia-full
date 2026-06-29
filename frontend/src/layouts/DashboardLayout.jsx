import { Outlet } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardLayout() {
  const { user, activeRole, roles, logout } = useAuth();

  return (
    <AppLayout
      userName={user?.name || 'User'}
      userEmail={user?.email || ''}
      userAvatar={user?.avatar || ''}
      userRole={activeRole || 'buyer'}
      roles={roles}
      onLogout={logout}
    >
      <Outlet />
    </AppLayout>
  );
}
