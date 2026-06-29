import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";


/**
 * @typedef {Object} BreadcrumbItem
 * @property {string} label
 * @property {string} [href]
 */

/**
 * @typedef {Object} TopHeaderProps
 * @property {function(): void} [onToggleSidebar]
 * @property {BreadcrumbItem[]} [breadcrumbs]
 * @property {string} [userName]
 * @property {string} [userEmail]
 * @property {string} [userAvatar]
 * @property {string} [userRole]
 * @property {number} [notificationCount]
 * @property {function(): void} [onLogout]
 * @property {string} [className]
 */

function Breadcrumb({ items }) {
  const location = useLocation();
  const pathname = location.pathname;

  // Auto-generate breadcrumbs from pathname if not provided
  const breadcrumbItems = items || (pathname !== "/" ? pathname.split("/").filter(Boolean).map((segment, index, array) => {
    const href = "/" + array.slice(0, index + 1).join("/");
    return {
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
      href: index < array.length - 1 ? href : undefined,
    };
  }) : []);

  if (breadcrumbItems.length === 0) {
    return (
      <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-blue-600">
        <span className="font-medium">Home</span>
      </Link>
    );
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600"
          >
            Home
          </Link>
        </li>
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <span className="text-slate-400">/</span>
            {item.href ? (
              <Link
                to={item.href}
                className="text-sm text-slate-500 hover:text-blue-600"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-sm font-medium text-slate-900">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function TopHeader({
  onToggleSidebar,
  breadcrumbs,
  userName = "User",
  userEmail = "user@example.com",
  userAvatar,
  userRole = "buyer",
  roles = [],
  notificationCount = 5,
  onLogout,
  className,
  ...props
}) {
  const navigate = useNavigate();

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-white px-4 shadow-sm",
          className
        )}
        {...props}
      >
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            onClick={onToggleSidebar}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>

          {/* Breadcrumbs - Hidden on mobile */}
          <div className="hidden md:block">
            <Breadcrumb items={breadcrumbs} />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="relative inline-flex items-center h-9 gap-2 pl-0 pr-2 rounded-md hover:bg-slate-100 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring">
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
              <div className="hidden flex-col items-start md:flex">
                <span className="text-sm font-medium text-slate-900">{userName}</span>
                <span className="text-xs text-slate-500 capitalize">{userRole}</span>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" />
            </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{userName}</p>
                        <p className="text-xs text-slate-500">{userEmail}</p>
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={onLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
}

export default TopHeader;
