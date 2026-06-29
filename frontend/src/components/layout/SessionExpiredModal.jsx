import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Clock } from 'lucide-react';

/**
 * SessionExpiredModal
 *
 * Tampil otomatis saat sesi pengguna berakhir tiba-tiba karena:
 * - reason 'expired' : token kedaluwarsa / dicabut (401)
 * - reason 'forbidden': role atau izin akses berubah di backend (403)
 *
 * Modal bersifat BLOCKING — user wajib klik "Login Ulang" untuk melanjutkan.
 */
export default function SessionExpiredModal() {
  const { sessionExpired, sessionExpiredReason, clearSessionExpired } = useAuth();
  const navigate = useNavigate();

  // Saat modal muncul, scroll ke atas (mencegah konten di bawah modal terlihat janggal)
  useEffect(() => {
    if (sessionExpired) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sessionExpired]);

  const handleLoginRedirect = () => {
    clearSessionExpired();
    navigate('/login', { replace: true });
  };

  // Pesan berbeda berdasarkan penyebab sesi berakhir
  const isExpired   = sessionExpiredReason === 'expired';

  const Icon        = isExpired ? Clock : ShieldAlert;
  const iconBg      = isExpired ? 'bg-amber-100' : 'bg-red-100';
  const iconColor   = isExpired ? 'text-amber-600' : 'text-red-600';

  const title = isExpired
    ? 'Sesi Anda Telah Berakhir'
    : 'Akses Ditolak';

  const description = isExpired
    ? 'Sesi login Anda telah kedaluwarsa karena tidak aktif atau token dicabut. Silakan login kembali untuk melanjutkan.'
    : 'Hak akses atau peran akun Anda telah berubah. Anda perlu login ulang agar perubahan diterapkan dengan benar.';

  return (
    <Dialog open={sessionExpired}>
      {/* Mencegah dismiss dengan klik luar modal */}
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex flex-col items-center text-center gap-3">
          {/* Ikon status */}
          <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${iconBg}`}>
            <Icon className={`h-7 w-7 ${iconColor}`} aria-hidden="true" />
          </div>

          <DialogTitle className="text-xl font-semibold">
            {title}
          </DialogTitle>
        </DialogHeader>

        <DialogDescription className="text-center text-sm text-muted-foreground px-2 py-2 leading-relaxed">
          {description}
        </DialogDescription>

        {/* Detail teknis (ringan, tidak menakutkan) */}
        <div className={`rounded-lg border px-4 py-3 text-xs text-center ${
          isExpired
            ? 'border-amber-200 bg-amber-50 text-amber-700'
            : 'border-red-200 bg-red-50 text-red-700'
        }`}>
          {isExpired
            ? '⏱ Token sesi tidak valid atau telah kedaluwarsa.'
            : '🔒 Izin akun Anda telah diperbarui oleh sistem.'}
        </div>

        <DialogFooter className="sm:justify-center pt-2">
          <Button
            onClick={handleLoginRedirect}
            className="w-full sm:w-auto bg-[#003f87] hover:bg-[#002f65] text-white"
          >
            Login Ulang
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
