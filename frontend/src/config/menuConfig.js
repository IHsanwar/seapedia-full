/**
 * Role-based Menu Configuration for Sidebar Navigation
 * 
 * This file defines the navigation menu items for each user role.
 * The Sidebar component uses these configurations to render
 * role-specific navigation menus.
 */

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Store,
  Wallet,
  MapPin,
  Users,
  Settings,
  FileText,
  BarChart3,
  Tag,
  CreditCard,
  Truck,
  Clock,
  Gift,
  Percent,
  Building2,
  Briefcase,
  History,
  CheckCircle,
} from "lucide-react";

// ============================================
// Admin Menu Configuration
// ============================================
export const adminMenuItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Vouchers",
    href: "/admin/vouchers",
    icon: Gift,
  },
  {
    label: "Promos",
    href: "/admin/promos",
    icon: Percent,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    label: "Stores",
    href: "/admin/stores",
    icon: Building2,
  },
  {
    label: "Deliveries",
    href: "/admin/deliveries",
    icon: Truck,
  },
  {
    label: "Overdue",
    href: "/admin/overdue",
    icon: Clock,
  },
];

// ============================================
// Seller Menu Configuration
// ============================================
export const sellerMenuItems = [
  {
    label: "Dashboard",
    href: "/seller/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    href: "/seller/products",
    icon: Package,
    children: [
      { label: "All Products", href: "/seller/products", icon: Package },
      { label: "Create Product", href: "/seller/products/create", icon: Tag },
    ],
  },
  {
    label: "Store",
    href: "/seller/store/edit",
    icon: Store,
    children: [
      { label: "Store Settings", href: "/seller/store/edit", icon: Settings },
      { label: "Create Store", href: "/seller/store/create", icon: Store },
    ],
  },
  {
    label: "Orders",
    href: "/seller/orders",
    icon: ShoppingCart,
  },
  {
    label: "Reports",
    href: "/seller/reports",
    icon: BarChart3,
  },
];

// ============================================
// Buyer Menu Configuration
// ============================================
export const buyerMenuItems = [
  {
    label: "Dashboard",
    href: "/buyer/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Wallet",
    href: "/buyer/wallet",
    icon: Wallet,
  },
  {
    label: "Addresses",
    href: "/buyer/addresses",
    icon: MapPin,
  },
  {
    label: "Cart",
    href: "/buyer/cart",
    icon: ShoppingCart,
  },
  {
    label: "Orders",
    href: "/buyer/orders",
    icon: Package,
  },
  {
    label: "Reports",
    href: "/buyer/reports",
    icon: FileText,
  },
];

// ============================================
// Driver Menu Configuration
// ============================================
export const driverMenuItems = [
  {
    label: "Dashboard",
    href: "/driver/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Jobs",
    href: "/driver/jobs",
    icon: Briefcase,
  },
  {
    label: "My Jobs",
    href: "/driver/my-jobs",
    icon: CheckCircle,
  },
  {
    label: "History",
    href: "/driver/history",
    icon: History,
  },
];

// ============================================
// Helper function to get menu items by role
// ============================================
export function getMenuItemsByRole(role) {
  switch (role) {
    case 'admin':
      return adminMenuItems;
    case 'seller':
      return sellerMenuItems;
    case 'buyer':
      return buyerMenuItems;
    case 'driver':
      return driverMenuItems;
    default:
      return buyerMenuItems;
  }
}

// ============================================
// Settings/System Menu Items (shared across roles)
// ============================================
export const settingsMenuItems = [
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["admin"],
    children: [
      { label: "General", href: "/settings", icon: Settings },
      { label: "Users & Roles", href: "/settings/users", icon: Users },
      { label: "Payment", href: "/settings/payment", icon: CreditCard },
    ],
  },
];

export default {
  adminMenuItems,
  sellerMenuItems,
  buyerMenuItems,
  driverMenuItems,
  settingsMenuItems,
  getMenuItemsByRole,
};
