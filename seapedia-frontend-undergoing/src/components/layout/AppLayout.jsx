"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TopHeader } from "./TopHeader";
import { Sidebar } from "./Sidebar";

/**
 * @typedef {Object} BreadcrumbItem
 * @property {string} label
 * @property {string} [href]
 */

/**
 * @typedef {Object} AppLayoutProps
 * @property {React.ReactNode} children - The main content to render
 * @property {BreadcrumbItem[]} [breadcrumbs] - Custom breadcrumb items
 * @property {string} [userName] - User display name
 * @property {string} [userEmail] - User email address
 * @property {string} [userAvatar] - User avatar URL
 * @property {string} [userRole] - User role for permission-based navigation
 * @property {number} [notificationCount] - Number of unread notifications
 * @property {function(): void} [onLogout] - Callback when user logs out
 * @property {boolean} [defaultSidebarCollapsed] - Initial sidebar collapsed state
 * @property {string} [className] - Additional CSS classes
 */

export function AppLayout({
  children,
  breadcrumbs,
  userName = "User",
  userEmail = "Loading...",
  userAvatar,
  userRole = "admin",
  roles = [],
  notificationCount = 0,
  onLogout,
  defaultSidebarCollapsed = false,
  className,
  ...props
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(defaultSidebarCollapsed);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  const handleToggleSidebar = () => {
    // On mobile, toggle the mobile sidebar
    if (window.innerWidth < 768) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    } else {
      // On desktop, toggle the collapsed state
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  // Handle window resize to reset mobile sidebar state
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={cn("min-h-screen bg-slate-50", className)} {...props}>
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={setIsSidebarCollapsed}
        userRole={userRole}
        userName={userName}
        userAvatar={userAvatar}
        roles={roles}
        className={cn(
          // Mobile sidebar handling
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      />

      {/* Mobile overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main content wrapper */}
      <div
        className={cn(
          "flex min-h-screen flex-col transition-all duration-300 ease-in-out",
          // Adjust margin based on sidebar width
          isSidebarCollapsed ? "md:ml-[72px]" : "md:ml-64"
        )}
      >
        {/* Top Header */}
        <TopHeader
          onToggleSidebar={handleToggleSidebar}
          breadcrumbs={breadcrumbs}
          userName={userName}
          userEmail={userEmail}
          userAvatar={userAvatar}
          userRole={userRole}
          roles={roles}
          notificationCount={notificationCount}
          onLogout={onLogout}
        />

        {/* Main Content Area */}
        <main className="flex-1 bg-slate-50 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Also export as default for flexibility
export default AppLayout;
