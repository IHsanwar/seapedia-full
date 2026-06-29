import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function DemoDisclaimerModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const isAcknowledged = localStorage.getItem('demo_acknowledged');
    if (!isAcknowledged) {
      setOpen(true);
    }
  }, []);

  const handleAcknowledge = () => {
    localStorage.setItem('demo_acknowledged', 'true');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent showCloseButton={false} className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="flex flex-col items-center sm:items-center text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 mb-4">
            <AlertTriangle className="h-6 w-6 text-yellow-600" aria-hidden="true" />
          </div>
          <DialogTitle className="text-xl">Pemberitahuan Penting</DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-center text-base py-4 text-foreground/80">
          Website ini hanyalah sebuah <strong>demonstrasi aplikasi</strong>.
          <br /><br />
          Tidak ada transaksi nyata yang terjadi. Semua proses seperti pemesanan, top-up saldo digital, pembayaran, dan pengiriman hanya berbentuk rekayasa sistem untuk keperluan demonstrasi secara online.
        </DialogDescription>
        <DialogFooter className="sm:justify-center">
          <Button onClick={handleAcknowledge} className="w-full sm:w-auto bg-[#003f87] hover:bg-[#002f65]">
            Saya Mengerti
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
