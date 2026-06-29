"use client";

import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, ChevronRight } from "lucide-react";

/**
 * @typedef {Object} BreadcrumbItem
 * @property {string} label - The display text for the breadcrumb
 * @property {string} [href] - The URL to navigate to (if not provided, item is current)
 */

/**
 * @typedef {Object} BreadcrumbProps
 * @property {BreadcrumbItem[]} [items] - Array of breadcrumb items. If not provided, will auto-generate from pathname
 * @property {string} [homeLabel] - Label for home link (default: "Home")
 * @property {string} [homeHref] - Href for home link (default: "/")
 * @property {React.ReactNode} [separator] - Custom separator element
 * @property {string} [className] - Additional CSS classes
 * @property {function(string): void} [onNavigate] - Callback when a breadcrumb is clicked
 * @property {boolean} [showHomeIcon] - Whether to show home icon instead of text
 * @property {string} [maxWidth] - Maximum width of the breadcrumb container
 */

// Default route labels mapping
const routeLabels = {
  dashboard: "Dashboard",
  products: "Products",
  orders: "Orders",
  customers: "Customers",
  analytics: "Analytics",
  content: "Content",
  messages: "Messages",
  settings: "Settings",
  profile: "Profile",
  users: "Users",
  categories: "Categories",
  inventory: "Inventory",
  pending: "Pending",
  completed: "Completed",
  sales: "Sales Report",
  users: "User Analytics",
  pages: "Pages",
  blog: "Blog Posts",
  media: "Media Library",
  general: "General",
  payment: "Payment",
  notifications: "Notifications",
};

function generateBreadcrumbsFromPathname(pathname) {
  if (!pathname || pathname === "/") return [];

  const segments = pathname.split("/").filter(Boolean);
  
  return segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = routeLabels[segment.toLowerCase()] || 
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    
    return { label, href: index < segments.length - 1 ? href : undefined };
  });
}

export function Breadcrumb({
  items,
  homeLabel = "Home",
  homeHref = "/",
  separator,
  className,
  onNavigate,
  showHomeIcon = true,
  maxWidth,
}) {
  const location = useLocation();
  const pathname = location.pathname;
  const breadcrumbItems = items || generateBreadcrumbsFromPathname(pathname);

  const handleClick = (href, event) => {
    if (onNavigate) {
      event.preventDefault();
      onNavigate(href);
    }
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center", className)}
      style={{ maxWidth }}
    >
      <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {/* Home Link */}
        <li className="flex items-center">
          <Link
            to={homeHref}
            onClick={(e) => handleClick(homeHref, e)}
            className={cn(
              "flex items-center gap-1.5 text-sm transition-colors hover:text-blue-600",
              breadcrumbItems.length === 0
                ? "font-medium text-slate-900"
                : "text-slate-500"
            )}
          >
            {showHomeIcon ? (
              <>
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">{homeLabel}</span>
              </>
            ) : (
              homeLabel
            )}
          </Link>
        </li>

        {/* Breadcrumb Items */}
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5 sm:gap-2">
            {separator || (
              <ChevronRight className="h-4 w-4 text-slate-300" />
            )}
            {item.href ? (
              <Link
                to={item.href}
                onClick={(e) => handleClick(item.href, e)}
                className="text-sm text-slate-500 transition-colors hover:text-blue-600"
                title={item.label}
              >
                <span className="max-w-[100px] truncate sm:max-w-[150px]">
                  {item.label}
                </span>
              </Link>
            ) : (
              <span
                className="text-sm font-medium text-slate-900"
                title={item.label}
              >
                <span className="max-w-[120px] truncate sm:max-w-[200px]">
                  {item.label}
                </span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Also export as default for flexibility
export default Breadcrumb;
