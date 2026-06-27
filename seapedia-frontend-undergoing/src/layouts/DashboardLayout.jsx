import { Outlet } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../contexts/AuthContext';

/**
 * DashboardLayout - A wrapper component that provides the AppLayout (sidebar navigation)
 * for all dashboard/admin/seller/buyer/driver pages.
 *
 * This layout wraps all protected routes that require the sidebar navigation.
 */
export default function DashboardLayout() {
  const { user, logout } = useAuth();

  // Get the active role from localStorage (if user has switched roles)
  const activeRole = localStorage.getItem('role') || user?.role || 'buyer';

  return (
    <AppLayout
      userName={user?.name || 'User'}
      userEmail={user?.email || ''}
      userAvatar={user?.avatar || ''}
      userRole={activeRole}
      onLogout={logout}
    >
      <Outlet />
    </AppLayout>
  );
}
