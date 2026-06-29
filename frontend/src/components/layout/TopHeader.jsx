import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup, 
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  CreditCard,
  HelpCircle,
  ChevronDown,
  X,
  Wallet,
  MapPin,
  ShoppingBag,
  Package,
  BarChart3,
  Truck,
  ClipboardList,
  History,
  Ticket,
  Tag,
  Building2,
  ArrowLeftRight,
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
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const navigate = useNavigate();

  const roleMenuItems = {
    buyer: [
      { label: "Wallet", href: "/buyer/wallet", icon: Wallet },
      { label: "Addresses", href: "/buyer/addresses", icon: MapPin },
      { label: "Orders", href: "/buyer/orders", icon: ShoppingBag },
    ],
    seller: [
      { label: "Products", href: "/seller/products", icon: Package },
      { label: "Orders", href: "/seller/orders", icon: ShoppingBag },
      { label: "Reports", href: "/seller/reports", icon: BarChart3 },
    ],
    driver: [
      { label: "Jobs", href: "/driver/jobs", icon: Truck },
      { label: "My Jobs", href: "/driver/my-jobs", icon: ClipboardList },
      { label: "History", href: "/driver/history", icon: History },
    ],
    admin: [
      { label: "Vouchers", href: "/admin/vouchers", icon: Ticket },
      { label: "Promos", href: "/admin/promos", icon: Tag },
      { label: "Stores", href: "/admin/stores", icon: Building2 },
    ],
  };

  const currentRoleItems = roleMenuItems[userRole] || [];

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

        {/* Center - Search */}
        <div className="hidden flex-1 justify-center px-4 sm:flex">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Search products, orders, customers..."
              className="h-10 w-full rounded-full border-slate-200 bg-slate-50 pl-10 pr-4 text-sm placeholder:text-slate-400 focus-visible:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-slate-600 hover:bg-slate-100 sm:hidden"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            <span className="sr-only">Search</span>
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger className="relative inline-flex items-center justify-center h-9 w-9 rounded-md text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring">
              
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <div className="p-4 text-center text-sm text-muted-foreground">
                Tidak ada notifikasi
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

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
                  {currentRoleItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link to={item.href} className="cursor-pointer">
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  {roles && roles.length > 1 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/select-role" className="cursor-pointer">
                          <ArrowLeftRight className="mr-2 h-4 w-4" />
                          Ganti Peran
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
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

      {/* Mobile Search Bar */} 
      {searchOpen && (
        <div className="fixed inset-x-0 top-16 z-20 border-b bg-white p-4 shadow-sm md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Search..."
              className="h-10 w-full rounded-lg border-slate-200 bg-slate-50 pl-10 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      )}
    </>
  );
}

export default TopHeader;
