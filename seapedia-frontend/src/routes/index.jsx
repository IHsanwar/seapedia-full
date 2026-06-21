import { Routes, Route } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import AuthLayout from '../layouts/AuthLayout';

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

// Pages - Seller
import SellerDashboardPage from '../pages/seller/SellerDashboardPage';
import StoreFormPage from '../pages/seller/StoreFormPage';
import ProductFormPage from '../pages/seller/ProductFormPage';
import ProductManagementPage from '../pages/seller/ProductManagementPage';

// Pages - Buyer
import WalletPage from '../pages/buyer/WalletPage';
import AddressPage from '../pages/buyer/AddressPage';
import CartPage from '../pages/buyer/CartPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:productSlug" element={<ProductDetailPage />} />
        <Route path="/stores/:storeSlug" element={<StoreDetailPage />} />

        <Route element={<ProtectedRoute requireRole={true} />}>
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/:role/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route element={<ProtectedRoute requireRole={true} allowedRoles={['seller']} />}>
          <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
          <Route path="/seller/products" element={<ProductManagementPage />} />
          <Route path="/seller/store/create" element={<StoreFormPage />} />
          <Route path="/seller/store/edit" element={<StoreFormPage />} />
          <Route path="/seller/products/create" element={<ProductFormPage />} />
          <Route path="/seller/products/:id/edit" element={<ProductFormPage />} />
        </Route>

        <Route element={<ProtectedRoute requireRole={true} allowedRoles={['buyer']} />}>
          <Route path="/buyer/wallet" element={<WalletPage />} />
          <Route path="/buyer/addresses" element={<AddressPage />} />
          <Route path="/buyer/cart" element={<CartPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<PublicLayout />}>
        <Route element={<ProtectedRoute requireRole={false} />}>
          <Route path="/select-role" element={<RoleSelectPage />} />
          <Route path="/logout" element={<LogoutPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

