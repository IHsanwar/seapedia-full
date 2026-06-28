import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Components
import ProtectedRoute from '../components/ProtectedRoute';

// Pages - Public
import HomePage from '../pages/HomePage';
import ProductListPage from '../pages/ProductListPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import StoreDetailPage from '../pages/StoreDetailPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import RoleSelectPage from '../pages/RoleSelectPage';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import DashboardRedirect from '../components/DashboardRedirect';
import LogoutPage from '../pages/LogoutPage';
import NotFoundPage from '../pages/NotFoundPage';
import VideoDemoPage from '../pages/VideoDemoPage';

// Pages - Seller
import SellerDashboardPage from '../pages/seller/SellerDashboardPage';
import StoreFormPage from '../pages/seller/StoreFormPage';
import ProductFormPage from '../pages/seller/ProductFormPage';
import ProductManagementPage from '../pages/seller/ProductManagementPage';
import SellerOrdersPage from '../pages/seller/SellerOrdersPage';
import SellerOrderDetailPage from '../pages/seller/SellerOrderDetailPage';
import SellerReportsPage from '../pages/seller/SellerReportsPage';

// Pages - Buyer
import WalletPage from '../pages/buyer/WalletPage';
import AddressPage from '../pages/buyer/AddressPage';
import CartPage from '../pages/buyer/CartPage';
import CheckoutPage from '../pages/buyer/CheckoutPage';
import OrderHistoryPage from '../pages/buyer/OrderHistoryPage';
import OrderDetailPage from '../pages/buyer/OrderDetailPage';
import BuyerReportsPage from '../pages/buyer/BuyerReportsPage';

// Pages - Admin
import VoucherManagementPage from '../pages/admin/VoucherManagementPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminOrdersPage from '../pages/admin/AdminOrdersPage';
import AdminStoresPage from '../pages/admin/AdminStoresPage';
import AdminDeliveriesPage from '../pages/admin/AdminDeliveriesPage';
import AdminOverduePage from '../pages/admin/AdminOverduePage';
import PromoManagementPage from '../pages/admin/PromoManagementPage';

// Pages - Driver
import DriverRegisterPage from '../pages/driver/DriverRegisterPage';
import DriverJobsPage from '../pages/driver/DriverJobsPage';
import DriverMyJobsPage from '../pages/driver/DriverMyJobsPage';
import DriverHistoryPage from '../pages/driver/DriverHistoryPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes - Using PublicLayout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:productSlug" element={<ProductDetailPage />} />
        <Route path="/stores/:storeSlug" element={<StoreDetailPage />} />
        <Route path="/video-demo" element={<VideoDemoPage />} />
      </Route>

      {/* Protected Routes with Dashboard Layout (Sidebar) */}
      <Route element={<ProtectedRoute requireRole={true} />}>
        <Route element={<DashboardLayout />}>
          {/* Common Dashboard */}
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/:role/dashboard" element={<DashboardPage />} />
          <Route path="/buyer" element={<Navigate to="/buyer/dashboard" replace />} />
          <Route path="/seller" element={<Navigate to="/seller/dashboard" replace />} />
          <Route path="/driver" element={<Navigate to="/driver/dashboard" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/driver/register" element={<DriverRegisterPage />} />

          {/* Seller Routes */}
          <Route element={<ProtectedRoute requireRole={true} allowedRoles={['seller']} />}>
            <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
            <Route path="/seller/products" element={<ProductManagementPage />} />
            <Route path="/seller/store/create" element={<StoreFormPage />} />
            <Route path="/seller/store/edit" element={<StoreFormPage />} />
            <Route path="/seller/products/create" element={<ProductFormPage />} />
            <Route path="/seller/products/:id/edit" element={<ProductFormPage />} />
            <Route path="/seller/orders" element={<SellerOrdersPage />} />
            <Route path="/seller/orders/:id" element={<SellerOrderDetailPage />} />
            <Route path="/seller/reports" element={<SellerReportsPage />} />
          </Route>

          {/* Buyer Routes */}
          <Route element={<ProtectedRoute requireRole={true} allowedRoles={['buyer']} />}>
            <Route path="/buyer/wallet" element={<WalletPage />} />
            <Route path="/buyer/addresses" element={<AddressPage />} />
            <Route path="/buyer/cart" element={<CartPage />} />
            <Route path="/buyer/checkout" element={<CheckoutPage />} />
            <Route path="/buyer/orders" element={<OrderHistoryPage />} />
            <Route path="/buyer/orders/:id" element={<OrderDetailPage />} />
            <Route path="/buyer/reports" element={<BuyerReportsPage />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute requireRole={true} allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/vouchers" element={<VoucherManagementPage />} />
            <Route path="/admin/promos" element={<PromoManagementPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/stores" element={<AdminStoresPage />} />
            <Route path="/admin/deliveries" element={<AdminDeliveriesPage />} />
            <Route path="/admin/overdue" element={<AdminOverduePage />} />
          </Route>

          {/* Driver Routes */}
          <Route element={<ProtectedRoute requireRole={true} allowedRoles={['driver']} />}>
            <Route path="/driver/jobs" element={<DriverJobsPage />} />
            <Route path="/driver/my-jobs" element={<DriverMyJobsPage />} />
            <Route path="/driver/history" element={<DriverHistoryPage />} />
          </Route>
        </Route>
      </Route>

      {/* Auth Routes - Separate Layout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Role Selection & Logout */}
      <Route element={<PublicLayout />}>
        <Route element={<ProtectedRoute requireRole={false} />}>
          <Route path="/select-role" element={<RoleSelectPage />} />
          <Route path="/logout" element={<LogoutPage />} />
        </Route>
      </Route>

      {/* 404 - Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
