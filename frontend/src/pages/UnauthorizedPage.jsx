import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { ShieldX, Home, ArrowLeft, LogIn } from 'lucide-react';

export default function UnauthorizedPage() {
  const { isAuthenticated, activeRole } = useAuth();
  const navigate = useNavigate();

  const dashboardPath =
    activeRole && activeRole !== 'none'
      ? `/${activeRole}/dashboard`
      : '/select-role';

  return (
    <div className="bg-[#f8f9ff] min-h-screen flex items-center justify-center px-4">
      <div className="bg-white border border-border shadow-sm rounded-sm p-10 sm:p-14 text-center space-y-6 max-w-lg w-full">

        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
          <ShieldX className="h-10 w-10 text-red-500" />
        </div>

        {/* Kode status */}
        <p className="text-6xl font-extrabold text-[#003f87] tracking-tight">403</p>

        {/* Judul */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#003f87]">Akses Ditolak</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Kamu tidak memiliki izin untuk mengakses halaman ini.
            Halaman ini mungkin dibatasi berdasarkan peran atau status login kamu.
          </p>
        </div>

        {/* Info role aktif */}
        {isAuthenticated && activeRole && activeRole !== 'none' && (
          <div className="inline-flex items-center gap-2 rounded-full border border-[#003f87]/20 bg-[#003f87]/5 px-4 py-1.5 text-xs text-[#003f87] font-medium">
            Role aktif saat ini:&nbsp;
            <span className="capitalize font-semibold">{activeRole}</span>
          </div>
        )}

        {/* Tombol aksi */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button
            variant="outline"
            className="border-[#003f87] text-[#003f87] hover:bg-[#003f87]/5 gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>

          {isAuthenticated ? (
            <Button
              className="bg-[#003f87] hover:bg-[#002f65] gap-2"
              onClick={() => navigate(dashboardPath)}
            >
              <Home className="h-4 w-4" />
              Ke Dasbor Saya
            </Button>
          ) : (
            <Button
              className="bg-[#003f87] hover:bg-[#002f65] gap-2"
              onClick={() => navigate('/login')}
            >
              <LogIn className="h-4 w-4" />
              Login Terlebih Dahulu
            </Button>
          )}
        </div>

        {/* Link bantuan */}
        <p className="text-xs text-muted-foreground">
          Jika kamu merasa ini adalah kesalahan, hubungi administrator sistem.
        </p>
      </div>
    </div>
  );
}
