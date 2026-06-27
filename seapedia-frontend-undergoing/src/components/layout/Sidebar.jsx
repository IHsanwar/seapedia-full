"use client";

import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  Store,
  Settings,
} from "lucide-react";

// Import role-specific menu configurations
import {
  adminMenuItems,
  sellerMenuItems,
  buyerMenuItems,
  driverMenuItems,
  settingsMenuItems,
} from "@/config/menuConfig";

/**
 * Get menu items based on user role
 * @param {string} role - User role (admin, seller, buyer, driver)
 * @returns {Array} Menu items for the role
 */
function getMenuItemsByRole(role) {
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

/**
 * NavItemComponent - Renders a single navigation item
 */
function NavItemComponent({ item, isCollapsed, userRole }) {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");

  const hasAccess = !item.roles || item.roles.includes(userRole || "admin");
  if (!hasAccess) return null;

  const content = (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-blue-50 text-blue-600"
          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
        isCollapsed && "justify-center px-2"
      )}
      onClick={() => hasChildren && !isCollapsed && setIsExpanded(!isExpanded)}
    >
      <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-blue-600" : "text-slate-500")} />
      {!isCollapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-slate-400 transition-transform",
                isExpanded && "rotate-180"
              )}
            />
          )}
        </>
      )}
    </div>
  );

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link to={item.href} className="block">
            {content}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-4">
          {item.label}
          {item.badge && <span className="ml-auto text-red-400">{item.badge}</span>}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div>
      {hasChildren ? (
        <div className="cursor-pointer">{content}</div>
      ) : (
        <Link to={item.href} className="block">
          {content}
        </Link>
      )}
      
      {!isCollapsed && hasChildren && isExpanded && (
        <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-200 pl-4">
          {item.children.map((child) => (
            <Link key={child.href} to={child.href}>
              <div
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  location.pathname === child.href
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <child.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{child.label}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Sidebar Component
 * @param {Object} props
 * @param {boolean} props.isCollapsed - Whether sidebar is collapsed
 * @param {function} props.onToggle - Toggle callback
 * @param {string} props.userRole - User role for menu filtering
 * @param {string} props.userName - User display name
 * @param {string} props.userAvatar - User avatar URL
 * @param {string} props.className - Additional CSS classes
 */
export function Sidebar({
  isCollapsed = false,
  onToggle,
  userRole = "buyer",
  userName = "User",
  userAvatar,
  className,
  ...props
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Get menu items based on user role
  const mainNavItems = React.useMemo(() => getMenuItemsByRole(userRole), [userRole]);

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <TooltipProvider delayDuration={0}>
        <aside
          className={cn(
            "fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-white transition-all duration-300 ease-in-out",
            isCollapsed ? "w-[72px]" : "w-64",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
            className
          )}
          {...props}
        >
          {/* Logo */}
          <div
            className={cn(
              "flex h-16 items-center border-b px-4",
              isCollapsed ? "justify-center px-2" : "justify-between"
            )}
          >
            {!isCollapsed ? (
              <>
                <Link to="/" className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                    <Store className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-bold text-slate-800">Seapedia</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500"
                  onClick={() => onToggle?.(true)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onToggle?.(false)}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                      <Store className="h-5 w-5 text-white" />
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Seapedia Admin</TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-1">
              {mainNavItems.map((item) => (
                <NavItemComponent
                  key={item.href}
                  item={item}
                  isCollapsed={isCollapsed}
                  userRole={userRole}
                />
              ))}
            </div>

            {/* Settings Section - Only show for admin */}
            {userRole === 'admin' && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                {!isCollapsed && (
                  <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    System
                  </h3>
                )}
                <div className="space-y-1">
                  {settingsMenuItems.map((item) => (
                    <NavItemComponent
                      key={item.href}
                      item={item}
                      isCollapsed={isCollapsed}
                      userRole={userRole}
                    />
                  ))}
                </div>
              </div>
            )}
          </nav>

          {/* User Profile */}
          <div className="border-t border-slate-200 p-3">
            {isCollapsed ? (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userAvatar} alt={userName} />
                      <AvatarFallback className="bg-blue-600 text-white text-xs">
                        {userName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="font-medium">{userName}</p>
                  <p className="text-xs text-slate-500 capitalize">{userRole}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback className="bg-blue-600 text-white text-sm">
                    {userName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {userName}
                  </p>
                  <p className="text-xs text-slate-500 capitalize truncate">
                    {userRole}
                  </p>
                </div>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Logout</TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </aside>
      </TooltipProvider>
    </>
  );
}

export default Sidebar;
