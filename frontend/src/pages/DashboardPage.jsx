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
  MapPin, Users, LayoutDashboard, ExternalLink, Plus, ShoppingCart, Tag,Clock
} from 'lucide-react';
import { toast } from 'react-toastify';

// ─── Role metadata ─────────────────────────────────────────────────────────
const ROLE_META = {
  buyer:  { icon: ShoppingBag, label: 'Buyer',  color: 'text-[#003f87]',   bg: 'bg-[#e6eeff]' },
  seller: { icon: Store,       label: 'Seller', color: 'text-[#006b5f]',  bg: 'bg-[#e0f2ef]' },
  driver: { icon: Truck,       label: 'Driver', color: 'text-[#722b00]', bg: 'bg-[#f0e6de]' },
  admin:  { icon: ShieldCheck, label: 'Admin',  color: 'text-[#003f87]', bg: 'bg-[#e6eeff]' },
};

// ─── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, colorClass, bgClass, comingSoon = false }) {
  return (
    <Card className="bg-white border border-border shadow-sm rounded-sm">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center gap-4">
          <div className={`${bgClass} ${colorClass} p-3 rounded-sm shrink-0`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
            {comingSoon ? (
              <p className="text-sm text-muted-foreground italic">Coming Soon</p>
            ) : (
              <p className={`text-lg font-bold ${colorClass}`}>{value}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Role-specific cards ────────────────────────────────────────────────────
function BuyerCards({ financial, addressCount }) {
  return (
    <>
      <StatCard icon={Wallet} label="Saldo Wallet"
        value={`Rp ${(financial?.wallet_balance ?? 0).toLocaleString('id-ID')}`}
        colorClass="text-[#003f87]" bgClass="bg-[#e6eeff]" />
      <StatCard icon={MapPin} label="Alamat Tersimpan" 
        value={addressCount}
        colorClass="text-[#003f87]" bgClass="bg-[#e6eeff]" />
    </>
  );
}

function SellerCards({ financial, sellerStats }) {
  return (
    <>
      <StatCard icon={TrendingUp} label="Pendapatan Seller"
        value={`Rp ${(financial?.seller_income ?? 0).toLocaleString('id-ID')}`}
        colorClass="text-[#006b5f]" bgClass="bg-[#e0f2ef]" />
      <StatCard icon={Package} label="Total Produk" value={sellerStats?.total_products ?? 0} colorClass="text-[#006b5f]" bgClass="bg-[#e0f2ef]" />
      <StatCard icon={ShoppingBag} label="Pesanan Masuk" value={sellerStats?.pending_orders ?? 0} colorClass="text-[#006b5f]" bgClass="bg-[#e0f2ef]" />
    </>
  );
}

function DriverCards({ financial, driverStats }) {
  return (
    <>
      <StatCard 
        icon={Wallet} 
        label="Penghasilan Driver"
        value={`Rp ${(financial?.driver_earnings ?? 0).toLocaleString('id-ID')}`}
        colorClass="text-[#722b00]" 
        bgClass="bg-[#f0e6de]" 
      />
      <StatCard 
        icon={Truck} 
        label="Job Selesai" 
        value={driverStats?.completed_jobs ?? 0}
        colorClass="text-[#722b00]" 
        bgClass="bg-[#f0e6de]" 
      />
      <StatCard 
        icon={MapPin} 
        label="Job Aktif" 
        value={driverStats?.active_jobs ?? 0}
        colorClass="text-[#722b00]" 
        bgClass="bg-[#f0e6de]" 
      />
    </>
  );
}

function AdminCards() {
  return (
    <>
      <StatCard icon={Users} label="Total Pengguna" value="—" colorClass="text-[#003f87]" bgClass="bg-[#e6eeff]" comingSoon />
      <StatCard icon={Package} label="Total Produk" value="—" colorClass="text-[#003f87]" bgClass="bg-[#e6eeff]" comingSoon />
      <StatCard icon={LayoutDashboard} label="Transaksi" value="—" colorClass="text-[#003f87]" bgClass="bg-[#e6eeff]" comingSoon />
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
  const [addressCount, setAddressCount] = useState(0);

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

  // Redirect driver to registration if they lack a driver profile
  useEffect(() => {
    if (role === 'driver' && user && user.has_driver_profile === false) {
      navigate('/driver/register', { replace: true });
    }
  }, [role, user, navigate]);

  // Redirect seller to store creation if they don't have a store yet
  useEffect(() => {
    if (role === 'seller' && user && user.has_store === false) {
      navigate('/seller/store/create', { replace: true });
    }
  }, [role, user, navigate]);

  useEffect(() => {
    if (!activeRole || activeRole === 'none') return;
    if (role && role !== activeRole) return;

    const abortController = new AbortController();
    const signal = abortController.signal;

    setLoadingDash(true);

    authAPI.getDashboard({ signal })
      .then((res) => {
        const data = res?.data?.data ?? res?.data ?? res;
        if (data && typeof data === 'object') {
          setDashboard({
            financial_summaries: data.financial_summaries ?? null,
            driver_stats: data.driver_stats ?? null,
            seller_stats: data.seller_stats ?? null,
          });
          if (typeof data.address_count === 'number') {
            setAddressCount(data.address_count);
          }
        } else {
          setDashboard(null);
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          toast.error(err.response?.data?.message || 'Gagal memuat data dashboard');
          setDashboard(null);
        }
      })
      .finally(() => {
        if (!signal.aborted) {
          setLoadingDash(false);
        }
      });

    return () => {
      abortController.abort();
    };
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
      const res = await authAPI.addRole(role);
      await fetchMe();
      
      // Driver memerlukan step tambahan: isi data kendaraan
      if (role === 'driver') {
        try {
          await switchRole('driver');
        } catch {
          // Jika gagal, fetchMe sudah update state
        }
        toast.success('Role driver berhasil ditambahkan! Silakan lengkapi data kendaraan.');
        navigate('/driver/register', { replace: true });
        return;
      }

      // Seller memerlukan step tambahan: buat toko
      if (role === 'seller') {
        try {
          await switchRole('seller');
        } catch {
          // Jika gagal, fetchMe sudah update state
        }
        toast.success('Role seller berhasil ditambahkan! Silakan buat toko terlebih dahulu.');
        navigate('/seller/store/create', { replace: true });
        return;
      }

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

  // Jika user memiliki role driver tapi belum memiliki profil driver (kendaraan) → arahkan ke registrasi (di-handle oleh useEffect)
  if (role === 'driver' && user?.has_driver_profile === false) {
    return null;
  }

  // Jika user memiliki role seller tapi belum memiliki toko → arahkan ke buat toko (di-handle oleh useEffect)
  if (role === 'seller' && user?.has_store === false) {
    return null;
  }

  // If user does not own this role (and it's a registerable role), display registration prompt
  if (role && ['buyer', 'seller', 'driver'].includes(role) && !roles.includes(role)) {
    const meta = ROLE_META[role] ?? ROLE_META.buyer;
    const Icon = meta.icon;
    
    // Driver requires special registration flow with vehicle data
    if (role === 'driver') {
      navigate('/driver/register');
      return null;
    }
    
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card className="bg-white border border-border shadow-sm rounded-sm">
          <CardHeader className="text-center pb-4">
            <div className={`mx-auto ${meta.bg} ${meta.color} p-4 rounded-sm mb-4 w-fit`}>
              <Icon className="h-10 w-10" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Daftar sebagai {meta.label}?</CardTitle>
            <CardDescription className="mt-2 text-sm text-muted-foreground">
              Kamu mencoba mengakses dashboard <strong>{meta.label}</strong>, tetapi akunmu belum terdaftar untuk role ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground text-center bg-[#f8f9ff] p-3 rounded-sm border border-border border-dashed">
              Dengan melanjutkan, sistem akan mendaftarkan role ini ke akunmu dan mengaktifkannya untuk sesi ini.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                className="w-full font-semibold bg-[#003f87] hover:bg-[#003070] text-white rounded-sm"
                disabled={registering}
                onClick={handleRegisterRole}
              >
                {registering && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Lanjutkan
              </Button>
              <Button
                variant="outline"
                className="w-full border-[#006b5f] text-[#006b5f] hover:bg-[#006b5f] hover:text-white rounded-sm"
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
        <Loader2 className="h-8 w-8 animate-spin text-[#003f87]" />
        <p className="text-sm text-muted-foreground capitalize">Beralih ke dashboard {role}…</p>
      </div>
    );
  }

  const meta    = ROLE_META[activeRole] ?? ROLE_META.buyer;
  const RoleIcon = meta.icon;
  const { financial_summaries = null, driver_stats = null } = dashboard ?? {};
  const financialData = financial_summaries;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl bg-[#f8f9ff]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Selamat datang, <span className="font-semibold text-foreground">{user?.name}</span>
          </p>
        </div>
        {activeRole && (
          <Badge className={`capitalize text-sm self-start sm:self-auto px-3 py-1.5 ${meta.bg} ${meta.color} border-0 rounded-sm`}>
            <RoleIcon className="h-3.5 w-3.5 mr-1.5" />
            {meta.label}
          </Badge>
        )}
      </div>

      {/* Role stats */}
      {loadingDash ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-8 p-4 rounded-sm border bg-white shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Memuat ringkasan…
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {activeRole === 'buyer'  && <BuyerCards  financial={financialData} addressCount={addressCount} />}
          {activeRole === 'seller' && <SellerCards financial={financialData} sellerStats={dashboard?.seller_stats} />}
          {activeRole === 'driver' && <DriverCards financial={financial_summaries} driverStats={driver_stats} />}
          {activeRole === 'admin'  && <AdminCards />}
          {(!activeRole || activeRole === 'none') && (
            <div className="col-span-3 text-center py-8 text-muted-foreground text-sm bg-white border border-border rounded-sm shadow-sm">
              Pilih role aktif untuk melihat ringkasan.
            </div>
          )}
        </div>
      )}

      {/* Role-specific action panel */}
      <Card className="mb-8 bg-white border border-border shadow-sm rounded-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className={`${meta.bg} ${meta.color} p-2.5 rounded-sm`}>
              <RoleIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base text-foreground">Panel {meta.label}</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {activeRole === 'seller' ? 'Kelola toko dan produkmu' : 'Fitur lengkap akan tersedia di level berikutnya'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activeRole === 'seller' && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1 font-medium bg-[#003f87] hover:bg-[#003070] text-white rounded-sm"
                onClick={() => navigate('/seller/dashboard')}
              >
                <Store className="h-4 w-4 mr-2" />
                Kelola Toko & Produk
                <ExternalLink className="h-3.5 w-3.5 ml-2 opacity-70" />
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-[#006b5f] text-[#006b5f] hover:bg-[#006b5f] hover:text-white rounded-sm"
                onClick={() => navigate('/seller/orders')}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Pesanan Masuk
                <ExternalLink className="h-3.5 w-3.5 ml-2 opacity-70" />
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-[#006b5f] text-[#006b5f] hover:bg-[#006b5f] hover:text-white rounded-sm"
                onClick={() => navigate('/seller/products/create')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Produk Baru
              </Button>
            </div>
          )}
          {activeRole === 'buyer' && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1 font-medium bg-[#003f87] hover:bg-[#003070] text-white rounded-sm"
                onClick={() => navigate('/buyer/wallet')}
              >
                <Wallet className="h-4 w-4 mr-2" />
                Kelola Wallet
                <ExternalLink className="h-3.5 w-3.5 ml-2 opacity-70" />
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-[#006b5f] text-[#006b5f] hover:bg-[#006b5f] hover:text-white rounded-sm"
                onClick={() => navigate('/buyer/addresses')}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Kelola Alamat
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-[#006b5f] text-[#006b5f] hover:bg-[#006b5f] hover:text-white rounded-sm"
                onClick={() => navigate('/buyer/cart')}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Keranjang Belanja
              </Button>

              

              <Button
                variant="outline"
                className="flex-1 border-[#006b5f] text-[#006b5f] hover:bg-[#006b5f] hover:text-white rounded-sm"
                onClick={() => navigate('/buyer/orders')}
              >
                <Package className="h-4 w-4 mr-2" />
                Riwayat Pesanan
                <ExternalLink className="h-3.5 w-3.5 ml-2 opacity-70" />
              </Button>
            </div>
          )}
          {activeRole === 'driver' && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1 font-medium bg-[#003f87] hover:bg-[#003070] text-white rounded-sm"
                onClick={() => navigate('/driver/jobs')}
              >
                <Truck className="h-4 w-4 mr-2" />
                Cari Job Pengiriman
                <ExternalLink className="h-3.5 w-3.5 ml-2 opacity-70" />
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-[#006b5f] text-[#006b5f] hover:bg-[#006b5f] hover:text-white rounded-sm"
                onClick={() => navigate('/driver/my-jobs')}
              >
                <Package className="h-4 w-4 mr-2" />
                Job Aktif
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-[#006b5f] text-[#006b5f] hover:bg-[#006b5f] hover:text-white rounded-sm"
                onClick={() => navigate('/driver/history')}
              >
                <Clock className="h-4 w-4 mr-2" />
                Riwayat Pengiriman
              </Button>
            </div>
          )}
          {activeRole === 'admin' && (
            <div className="flex flex-wrap gap-3">
              <Button
                className="font-medium bg-[#003f87] hover:bg-[#003070] text-white rounded-sm"
                onClick={() => navigate('/admin/dashboard')}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard Monitoring
                <ExternalLink className="h-3.5 w-3.5 ml-2 opacity-70" />
              </Button>
              <Button
                variant="outline"
                className="border-[#006b5f] text-[#006b5f] hover:bg-[#006b5f] hover:text-white rounded-sm"
                onClick={() => navigate('/admin/vouchers')}
              >
                <Tag className="h-4 w-4 mr-2" />
                Kelola Voucher
              </Button>
              <Button
                variant="outline"
                className="border-[#006b5f] text-[#006b5f] hover:bg-[#006b5f] hover:text-white rounded-sm"
                onClick={() => navigate('/admin/promos')}
              >
                <Tag className="h-4 w-4 mr-2" />
                Kelola Promo
              </Button>
              <Button
                variant="outline"
                className="border-[#006b5f] text-[#006b5f] hover:bg-[#006b5f] hover:text-white rounded-sm"
                onClick={() => navigate('/admin/orders')}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Monitor Orders
              </Button>
              <Button
                variant="outline"
                className="border-[#006b5f] text-[#006b5f] hover:bg-[#006b5f] hover:text-white rounded-sm"
                onClick={() => navigate('/admin/stores')}
              >
                <Store className="h-4 w-4 mr-2" />
                Monitor Stores
              </Button>
              <Button
                variant="outline"
                className="border-[#006b5f] text-[#006b5f] hover:bg-[#006b5f] hover:text-white rounded-sm"
                onClick={() => navigate('/admin/deliveries')}
              >
                <Truck className="h-4 w-4 mr-2" />
                Monitor Deliveries
              </Button>
              <Button
                variant="outline"
                className="border-[#722b00] text-[#722b00] hover:bg-[#722b00] hover:text-white rounded-sm"
                onClick={() => navigate('/admin/overdue')}
              >
                <Clock className="h-4 w-4 mr-2" />
                Overdue Handling
              </Button>
            </div>
          )}
          {activeRole !== 'seller' && activeRole !== 'buyer' && activeRole !== 'driver' && activeRole !== 'admin' && (
            <div className="text-sm text-muted-foreground bg-white rounded-sm p-4 border border-border shadow-sm">
              {(!activeRole || activeRole === 'none') && 'Silakan pilih role aktif terlebih dahulu.'}
            </div>
          )}
        </CardContent>
        
      </Card>

      </div>
  );
}
