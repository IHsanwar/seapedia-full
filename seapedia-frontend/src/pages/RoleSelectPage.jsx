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
    color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'hover:border-blue-400',
  },
  seller: {
    icon: Store, label: 'Seller',
    desc: 'Kelola toko, listing produk, dan proses pesanan masuk.',
    color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950',
    border: 'hover:border-green-400',
  },
  driver: {
    icon: Truck, label: 'Driver',
    desc: 'Temukan job pengiriman, ambil job, dan selesaikan pengiriman.',
    color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950',
    border: 'hover:border-orange-400',
  },
  admin: {
    icon: ShieldCheck, label: 'Admin',
    desc: 'Monitor marketplace, kelola pengguna, dan akses administrasi sistem.',
    color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950',
    border: 'hover:border-purple-400',
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
      await switchRole(role);
      toast.success(`Berhasil daftar dan masuk sebagai ${ROLE_META[role]?.label ?? role}!`);
      navigate(`/${role}/dashboard`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mendaftar role');
      setIsSwitching(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-3">
          Halo, {user?.name} 👋
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
              className={`border-2 transition-all cursor-pointer hover:shadow-md ${m.border} ${
                isSwitching && !loading ? 'opacity-50' : ''
              }`}
            >
              <CardHeader className="text-center pb-2">
                <div className={`mx-auto ${m.bg} ${m.color} p-4 rounded-2xl mb-3 w-fit`}>
                  <Icon className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">{m.label}</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-sm text-muted-foreground pb-2 min-h-[60px]">
                {m.desc}
              </CardContent>
              <div className="p-4 pt-2">
                <Button
                  className="w-full"
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
  );
}
