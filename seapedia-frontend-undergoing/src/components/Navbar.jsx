import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { ShoppingBag, Menu, X, ShoppingCart } from 'lucide-react';
export default function Navbar() {
  const { user, isAuthenticated, activeRole } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo + Desktop Nav */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl tracking-tight">SEAPEDIA</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link to="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Beranda
            </Link>
            <Link to="/products" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Produk
            </Link>
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {activeRole === 'buyer' && (
                <Link to="/buyer/cart" className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground relative transition-colors mr-1" aria-label="Lihat Keranjang">
                  <ShoppingCart className="h-5 w-5" />
                </Link>
              )}
              {activeRole && activeRole !== 'none' && (
                <Badge variant="secondary" className="hidden sm:inline-flex capitalize">
                  {activeRole}
                </Badge>
              )}

              {/* Fix: DropdownMenuTrigger renders as <button> from @base-ui.
                  We pass a styled div as the trigger child to avoid button-in-button. */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer"
                  aria-label="Menu pengguna"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                        {activeRole && activeRole !== 'none' && (
                          <Badge variant="outline" className="mt-1 w-fit capitalize text-xs">
                            {activeRole}
                          </Badge>
                        )}
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(activeRole && activeRole !== 'none' ? `/${activeRole}/dashboard` : '/dashboard')}>
                    Dasbor
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/select-role')}>
                    Ganti Peran
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/logout')} variant="destructive">
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Masuk</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Daftar</Link>
              </Button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Buka/tutup menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 flex flex-col gap-3">
          <Link to="/" onClick={() => setMobileOpen(false)}
            className="text-sm font-medium py-2 text-muted-foreground hover:text-primary">
            Beranda
          </Link>
          <Link to="/products" onClick={() => setMobileOpen(false)}
            className="text-sm font-medium py-2 text-muted-foreground hover:text-primary">
            Produk
          </Link>
          {!isAuthenticated && (
            <>
              <hr className="border-border" />
              <Link to="/login" onClick={() => setMobileOpen(false)}
                className="text-sm font-medium py-2 text-muted-foreground hover:text-primary">
                Masuk
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)}
                className="text-sm font-medium py-2 text-muted-foreground hover:text-primary">
                Daftar
              </Link>
            </>
          )}
          {isAuthenticated && (
            <>
              <hr className="border-border" />
              <Link to={activeRole && activeRole !== 'none' ? `/${activeRole}/dashboard` : '/dashboard'} onClick={() => setMobileOpen(false)}
                className="text-sm font-medium py-2 text-muted-foreground hover:text-primary">
                Dasbor
              </Link>
              <Link to="/select-role" onClick={() => setMobileOpen(false)}
                className="text-sm font-medium py-2 text-muted-foreground hover:text-primary">
                Ganti Peran
              </Link>
              <button type="button" onClick={() => { setMobileOpen(false); navigate('/logout'); }}
                className="text-sm font-medium py-2 text-destructive hover:text-destructive/80 text-left">
                Keluar
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
