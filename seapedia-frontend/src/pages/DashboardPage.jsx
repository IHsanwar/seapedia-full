import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../api/auth';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  ShoppingBag, Store, Truck, ShieldCheck,
  Loader2, RefreshCw, Wallet, TrendingUp, Package,
  MapPin, Users, LayoutDashboard, ExternalLink, Plus,
} from 'lucide-react';
import { toast } from 'react-toastify';

// ─── Role metadata ─────────────────────────────────────────────────────────
const ROLE_META = {
  buyer:  { icon: ShoppingBag, label: 'Buyer',  color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-950' },
  seller: { icon: Store,       label: 'Seller', color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-950' },
  driver: { icon: Truck,       label: 'Driver', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950' },
  admin:  { icon: ShieldCheck, label: 'Admin',  color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950' },
};

// ─── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, bg, comingSoon = false }) {
  return (
    <Card className="border">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center gap-4">
          <div className={`${bg} ${color} p-3 rounded-xl shrink-0`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
            {comingSoon ? (
              <p className="text-sm text-muted-foreground italic">Coming Soon</p>
            ) : (
              <p className="text-lg font-bold">{value}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Role-specific cards ────────────────────────────────────────────────────
function BuyerCards({ financial }) {
  return (
    <>
      <StatCard icon={Wallet} label="Saldo Wallet"
        value={`Rp ${(financial?.wallet_balance ?? 0).toLocaleString('id-ID')}`}
        color="text-blue-600" bg="bg-blue-50 dark:bg-blue-950" />
      <StatCard icon={ShoppingBag} label="Total Pesanan" value="—" color="text-blue-600" bg="bg-blue-50 dark:bg-blue-950" comingSoon />
      <StatCard icon={MapPin} label="Alamat Tersimpan" value="—" color="text-blue-600" bg="bg-blue-50 dark:bg-blue-950" comingSoon />
    </>
  );
}

function SellerCards({ financial }) {
  return (
    <>
      <StatCard icon={TrendingUp} label="Pendapatan Seller"
        value={`Rp ${(financial?.seller_income ?? 0).toLocaleString('id-ID')}`}
        color="text-green-600" bg="bg-green-50 dark:bg-green-950" />
      <StatCard icon={Package} label="Total Produk" value="—" color="text-green-600" bg="bg-green-50 dark:bg-green-950" comingSoon />
      <StatCard icon={ShoppingBag} label="Pesanan Masuk" value="—" color="text-green-600" bg="bg-green-50 dark:bg-green-950" comingSoon />
    </>
  );
}

function DriverCards({ financial }) {
  return (
    <>
      <StatCard icon={Wallet} label="Penghasilan Driver"
        value={`Rp ${(financial?.driver_earnings ?? 0).toLocaleString('id-ID')}`}
        color="text-orange-600" bg="bg-orange-50 dark:bg-orange-950" />
      <StatCard icon={Truck} label="Job Selesai" value="—" color="text-orange-600" bg="bg-orange-50 dark:bg-orange-950" comingSoon />
      <StatCard icon={MapPin} label="Job Aktif" value="—" color="text-orange-600" bg="bg-orange-50 dark:bg-orange-950" comingSoon />
    </>
  );
}

function AdminCards() {
  return (
    <>
      <StatCard icon={Users} label="Total Pengguna" value="—" color="text-purple-600" bg="bg-purple-50 dark:bg-purple-950" comingSoon />
      <StatCard icon={Package} label="Total Produk" value="—" color="text-purple-600" bg="bg-purple-50 dark:bg-purple-950" comingSoon />
      <StatCard icon={LayoutDashboard} label="Transaksi" value="—" color="text-purple-600" bg="bg-purple-50 dark:bg-purple-950" comingSoon />
    </>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { role } = useParams();
  const { user, activeRole, roles, switchRole, fetchMe } = useAuth();
  const navigate   = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loadingDash, setLoadingDash] = useState(false);
  const [switching, setSwitching]     = useState(null);
  const [autoSwitching, setAutoSwitching] = useState(false);
  const [registering, setRegistering] = useState(false);

  // Sync role from URL parameters with current session activeRole
  useEffect(() => {
    if (!role) return;

    // Check if the URL role is valid and authorized or if admin is allowed
    const isValid = ['buyer', 'seller', 'driver', 'admin'].includes(role);
    if (!isValid || (role === 'admin' && !roles.includes('admin'))) {
      toast.error(`Akses ditolak: role ${role} tidak valid`);
      if (activeRole && activeRole !== 'none') {
        navigate(`/${activeRole}/dashboard`, { replace: true });
      } else {
        navigate('/select-role', { replace: true });
      }
      return;
    }

    // Auto-switch role if user owns the role but it's not currently activeRole
    if (roles.includes(role) && role !== activeRole) {
      Promise.resolve().then(() => setAutoSwitching(true));
      switchRole(role)
        .then(() => {
          toast.success(`Beralih ke mode ${role}`);
        })
        .catch((err) => {
          toast.error(err.response?.data?.message || `Gagal beralih ke role ${role}`);
          if (activeRole && activeRole !== 'none') {
            navigate(`/${activeRole}/dashboard`, { replace: true });
          } else {
            navigate('/select-role', { replace: true });
          }
        })
        .finally(() => {
          setAutoSwitching(false);
        });
    }
  }, [role, activeRole, roles, navigate, switchRole]);

  useEffect(() => {
    if (!activeRole || activeRole === 'none') return;
    if (role && role !== activeRole) return;

    Promise.resolve().then(() => setLoadingDash(true));
    authAPI.getDashboard()
      .then((res) => setDashboard(res?.data ?? res))
      .catch(() => {})
      .finally(() => setLoadingDash(false));
  }, [activeRole, role]);

  const handleSwitch = async (targetRole) => {
    setSwitching(targetRole);
    try {
      await switchRole(targetRole);
      toast.success(`Beralih ke mode ${targetRole}`);
      navigate(`/${targetRole}/dashboard`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal beralih role');
    } finally {
      setSwitching(null);
    }
  };

  const handleRegisterRole = async () => {
    setRegistering(true);
    try {
      await authAPI.addRole(role);
      await fetchMe();
      await switchRole(role);
      toast.success(`Berhasil daftar dan masuk sebagai ${ROLE_META[role]?.label ?? role}!`);
    } catch (err) {
      toast.error(err.response?.data?.message || `Gagal mendaftar sebagai ${role}`);
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegister = () => {
    if (activeRole && activeRole !== 'none') {
      navigate(`/${activeRole}/dashboard`);
    } else {
      navigate('/select-role');
    }
  };

  // If user does not own this role (and it's a registerable role), display registration prompt
  if (role && ['buyer', 'seller', 'driver'].includes(role) && !roles.includes(role)) {
    const meta = ROLE_META[role] ?? ROLE_META.buyer;
    const Icon = meta.icon;
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card className="border-2 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className={`mx-auto ${meta.bg} ${meta.color} p-4 rounded-2xl mb-4 w-fit`}>
              <Icon className="h-10 w-10" />
            </div>
            <CardTitle className="text-2xl font-bold">Daftar sebagai {meta.label}?</CardTitle>
            <CardDescription className="mt-2 text-sm text-muted-foreground">
              Kamu mencoba mengakses dashboard <strong>{meta.label}</strong>, tetapi akunmu belum terdaftar untuk role ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground text-center bg-muted/40 p-3 rounded-lg border border-dashed">
              Dengan melanjutkan, sistem akan mendaftarkan role ini ke akunmu dan mengaktifkannya untuk sesi ini.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                className="w-full font-semibold"
                disabled={registering}
                onClick={handleRegisterRole}
              >
                {registering && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Lanjutkan
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={registering}
                onClick={handleCancelRegister}
              >
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (autoSwitching || (role && role !== activeRole)) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground capitalize">Beralih ke dashboard {role}…</p>
      </div>
    );
  }

  const meta    = ROLE_META[activeRole] ?? ROLE_META.buyer;
  const RoleIcon = meta.icon;
  const financial = dashboard?.financial_summaries ?? null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Selamat datang, <span className="font-semibold text-foreground">{user?.name}</span>
          </p>
        </div>
        {activeRole && (
          <Badge className={`capitalize text-sm self-start sm:self-auto px-3 py-1.5 ${meta.bg} ${meta.color} border-0`}>
            <RoleIcon className="h-3.5 w-3.5 mr-1.5" />
            {meta.label}
          </Badge>
        )}
      </div>

      {/* Role stats */}
      {loadingDash ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-8 p-4 rounded-lg border bg-muted/30">
          <Loader2 className="h-4 w-4 animate-spin" /> Memuat ringkasan…
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {activeRole === 'buyer'  && <BuyerCards  financial={financial} />}
          {activeRole === 'seller' && <SellerCards financial={financial} />}
          {activeRole === 'driver' && <DriverCards financial={financial} />}
          {activeRole === 'admin'  && <AdminCards />}
          {(!activeRole || activeRole === 'none') && (
            <div className="col-span-3 text-center py-8 text-muted-foreground text-sm border rounded-xl border-dashed">
              Pilih role aktif untuk melihat ringkasan.
            </div>
          )}
        </div>
      )}

      {/* Role-specific action panel */}
      <Card className="mb-8 border bg-muted/10">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className={`${meta.bg} ${meta.color} p-2.5 rounded-lg`}>
              <RoleIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">Panel {meta.label}</CardTitle>
              <CardDescription className="text-xs">
                {activeRole === 'seller' ? 'Kelola toko dan produkmu' : 'Fitur lengkap akan tersedia di level berikutnya'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activeRole === 'seller' && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1 font-medium"
                onClick={() => navigate('/seller/dashboard')}
              >
                <Store className="h-4 w-4 mr-2" />
                Kelola Toko & Produk
                <ExternalLink className="h-3.5 w-3.5 ml-2 opacity-70" />
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/seller/products/create')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Produk Baru
              </Button>
            </div>
          )}
          {activeRole !== 'seller' && (
            <div className="text-sm text-muted-foreground bg-background rounded-lg p-4 border">
              {activeRole === 'buyer'  && 'Keranjang belanja, riwayat pesanan, dan manajemen alamat pengiriman akan muncul di sini.'}
              {activeRole === 'driver' && 'Job pengiriman tersedia, rute aktif, dan riwayat pengiriman akan muncul di sini.'}
              {activeRole === 'admin'  && 'Panel monitoring marketplace, manajemen user, dan kontrol operasional akan muncul di sini.'}
              {(!activeRole || activeRole === 'none') && 'Silakan pilih role aktif terlebih dahulu.'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Switch role */}
      {roles.length > 1 && (
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <RefreshCw className="h-3.5 w-3.5" />
            Beralih ke role lain
          </p>
          <div className="flex flex-wrap gap-3">
            {roles.filter((r) => r !== activeRole).map((role) => {
              const m = ROLE_META[role] ?? ROLE_META.buyer;
              const Icon = m.icon;
              return (
                <Button key={role} variant="outline" size="sm"
                  disabled={switching !== null}
                  onClick={() => handleSwitch(role)}
                  className="capitalize">
                  {switching === role
                    ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    : <Icon className="h-3.5 w-3.5 mr-1.5" />}
                  {m.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
