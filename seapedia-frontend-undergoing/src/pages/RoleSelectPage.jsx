import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../api/auth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ShoppingBag, Truck, ShieldCheck, Store, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const ROLE_META = {
  buyer:  {
    icon: ShoppingBag, label: 'Buyer',
    desc: 'Belanja produk, kelola keranjang, dan lacak pesanan.',
    color: 'text-[#003f87]',
    bg: 'bg-[#003f87]/10',
    border: 'hover:border-[#003f87]',
  },
  seller: {
    icon: Store, label: 'Seller',
    desc: 'Kelola toko, listing produk, dan proses pesanan masuk.',
    color: 'text-[#006b5f]',
    bg: 'bg-[#006b5f]/10',
    border: 'hover:border-[#006b5f]',
  },
  driver: {
    icon: Truck, label: 'Driver',
    desc: 'Temukan job pengiriman, ambil job, dan selesaikan pengiriman.',
    color: 'text-[#722b00]',
    bg: 'bg-[#722b00]/10',
    border: 'hover:border-[#722b00]',
  },
  admin: {
    icon: ShieldCheck, label: 'Admin',
    desc: 'Monitor marketplace, kelola pengguna, dan akses administrasi sistem.',
    color: 'text-[#003f87]',
    bg: 'bg-[#003f87]/10',
    border: 'hover:border-[#003f87]',
  },
};

const ALL_NON_ADMIN_ROLES = ['buyer', 'seller', 'driver'];

export default function RoleSelectPage() {
  const { user, roles, switchRole, fetchMe } = useAuth();
  const navigate = useNavigate();
  const [isSwitching, setIsSwitching] = useState(null);
  //check if user already login
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Auto redirect admin to dashboard immediately
  useEffect(() => {
    if (roles.includes('admin')) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [roles, navigate]);

  const handleRoleSelect = async (role) => {
    setIsSwitching(role);
    try {
      await switchRole(role);

      if (role === 'seller' && user?.has_store === false) {
        toast.success('Selamat datang sebagai Seller! Silakan buat toko terlebih dahulu.');
        navigate('/seller/store/create');
        return;
      }

      if (role === 'driver' && user?.has_driver_profile === false) {
        toast.success('Selamat datang sebagai Driver! Silakan lengkapi data kendaraan.');
        navigate('/driver/register');
        return;
      }

      toast.success(`Selamat datang sebagai ${ROLE_META[role]?.label ?? role}!`);
      navigate(`/${role}/dashboard`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal beralih role');
      setIsSwitching(null);
    }
  };

  const handleRoleRegister = async (role) => {
    setIsSwitching(role);
    try {
      await authAPI.addRole(role);
      await fetchMe();

      if (role === 'driver') {
        try {
          await switchRole('driver');
        } catch {
          // Jika switchRole gagal, fetchMe sudah cukup untuk update state
        }
        toast.success('Role driver berhasil ditambahkan! Silakan lengkapi data kendaraan.');
        navigate('/driver/register');
        return;
      }

      if (role === 'seller') {
        try {
          await switchRole('seller');
        } catch {
          // Jika switchRole gagal, fetchMe sudah cukup untuk update state
        }
        toast.success('Role seller berhasil ditambahkan! Silakan buat toko terlebih dahulu.');
        navigate('/seller/store/create');
        return;
      }

      await switchRole(role);
      toast.success(`Berhasil daftar dan masuk sebagai ${ROLE_META[role]?.label ?? role}!`);
      navigate(`/${role}/dashboard`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mendaftar role');
      setIsSwitching(null);
    }
  };

  return (
    <div className="bg-[#f8f9ff] min-h-screen">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#003f87] mb-3">
            Halo, {user?.name}
          </h1>
          <p className="text-muted-foreground text-lg">
            Pilih sebagai siapa kamu ingin melanjutkan hari ini, atau daftarkan diri ke role baru.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ALL_NON_ADMIN_ROLES.map((role) => {
            const m = ROLE_META[role] ?? ROLE_META.buyer;
            const Icon = m.icon;
            const loading = isSwitching === role;
            const isOwned = roles.includes(role);

            const handleAction = () => {
              if (isSwitching) return;
              if (isOwned) {
                handleRoleSelect(role);
              } else {
                handleRoleRegister(role);
              }
            };

            return (
              <Card
                key={role}
                onClick={handleAction}
                className={`bg-white border border-border shadow-sm rounded-sm transition-all cursor-pointer hover:shadow-md ${m.border} ${
                  isSwitching && !loading ? 'opacity-50' : ''
                }`}
              >
                <CardHeader className="text-center pb-2">
                  <div className={`mx-auto ${m.bg} ${m.color} p-4 rounded-sm mb-3 w-fit`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl text-[#003f87]">{m.label}</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-sm text-muted-foreground pb-2 min-h-[60px]">
                  {m.desc}
                </CardContent>
                <div className="p-4 pt-2">
                  <Button
                    className={`w-full ${isOwned ? 'bg-[#003f87] hover:bg-[#002f65]' : 'border-[#003f87] text-[#003f87] hover:bg-[#003f87] hover:text-white'}`}
                    variant={isOwned ? "default" : "outline"}
                    disabled={isSwitching !== null}
                    onClick={(e) => { e.stopPropagation(); handleAction(); }}
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {loading
                      ? 'Memproses…'
                      : isOwned
                        ? `Lanjut sebagai ${m.label}`
                        : `Daftar sebagai ${m.label}`}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
