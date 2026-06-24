import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { 
  Ticket, 
  Loader2, 
  Tag, 
  Percent, 
  CheckCircle2,
  X,
  AlertCircle,
  Gift,
  ChevronRight
} from 'lucide-react';
import { voucherAPI } from '../../api/vouchers';
import { promosAPI } from '../../api/promos';
import { toast } from 'react-toastify';

export default function DiscountSelector({ subtotal, onApplyDiscount, appliedDiscount, onRemoveDiscount }) {
  const [isOpen, setIsOpen] = useState(false);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingDiscounts, setFetchingDiscounts] = useState(false);
  const [discountCode, setDiscountCode] = useState('');

  // Fetch available promos when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAvailableDiscounts();
    }
  }, [isOpen]);

  const fetchAvailableDiscounts = async () => {
    setFetchingDiscounts(true);
    try {
      const response = await promosAPI.getAvailablePromos();
      setPromos(response.data || []);
    } catch (error) {
      console.error('Error fetching discounts:', error);
      toast.error('Gagal memuat promo');
    } finally {
      setFetchingDiscounts(false);
    }
  };

  const handleApplyDiscount = async (code = discountCode) => {
    if (!code.trim()) {
      toast.error('Masukkan kode diskon');
      return;
    }

    setLoading(true);
    try {
      let response;
      let success = false;
      let errorMsg = '';
      let appliedType = 'promo';
      
      // Try applying as promo first
      try {
        response = await promosAPI.applyPromo(code, subtotal);
        if (response.success) {
          success = true;
          appliedType = 'promo';
        }
      } catch (err) {
        // Fallback: Try applying as voucher (private code)
        try {
          response = await voucherAPI.applyVoucher(code, subtotal);
          if (response.success) {
            success = true;
            appliedType = 'voucher';
          }
        } catch (voucherErr) {
          errorMsg = voucherErr.response?.data?.message || err.response?.data?.message || 'Kode diskon tidak valid atau tidak ditemukan';
        }
      }
      
      if (success && response) {
        const discountVal = response.data.discount;
        onApplyDiscount({
          type: appliedType,
          code: response.data.voucher?.code || response.data.promo?.code || code,
          discount: discountVal,
          data: response.data.voucher || response.data.promo,
        });
        toast.success(`${appliedType === 'voucher' ? 'Voucher' : 'Promo'} berhasil dipasang! Diskon Rp ${discountVal.toLocaleString('id-ID')}`);
        setDiscountCode('');
        setIsOpen(false);
      } else {
        toast.error(errorMsg || 'Gagal menerapkan diskon');
      }
    } catch (error) {
      console.error('Error applying discount:', error);
      toast.error('Gagal menerapkan diskon');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDiscount = () => {
    onRemoveDiscount();
    toast.info('Diskon dibatalkan');
  };

  const renderPromoCard = (item) => {
    const isMinPurchaseMet = parseFloat(subtotal) >= parseFloat(item.minimum_purchase || 0);
    return (
      <div
        key={item.id}
        className={`relative overflow-hidden border rounded-xl bg-card shadow-sm hover:shadow transition-all group flex flex-col ${
          !isMinPurchaseMet ? 'opacity-65 cursor-not-allowed border-border' : 'cursor-pointer hover:border-violet-500/50'
        }`}
        onClick={() => isMinPurchaseMet && handleApplyDiscount(item.code)}
      >
        {/* Top Gradient Stripe */}
        <div className="h-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600" />
        
        <div className="p-4 flex gap-4">
          {/* Icon Box */}
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20 flex items-center justify-center shrink-0 border border-violet-100 dark:border-violet-900/50 text-violet-600 dark:text-violet-400 group-hover:scale-105 transition-transform">
            <Gift className="h-5 w-5" />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono font-bold text-xs bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded border border-violet-200 dark:border-violet-900">
                {item.code}
              </span>
              <Badge className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-600 hover:to-indigo-600 text-[9px] text-white border-0 py-0.5 rounded-md px-2">
                PROMO
              </Badge>
            </div>
            
            <p className="text-sm font-bold text-foreground mt-2">
              {item.type === 'fixed' 
                ? `Potongan Rp ${parseFloat(item.value).toLocaleString('id-ID')}`
                : `Diskon ${item.value}%`
              }
              {item.max_discount && ` (Maks. Rp ${parseFloat(item.max_discount).toLocaleString('id-ID')})`}
            </p>
            
            {item.minimum_purchase > 0 && (
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Min. belanja Rp {parseFloat(item.minimum_purchase).toLocaleString('id-ID')}
              </p>
            )}

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-muted">
              <span className="text-[10px] text-muted-foreground font-medium">
                Berlaku s/d: {new Date(item.expired_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              </span>
              {isMinPurchaseMet ? (
                <Button size="xs" variant="outline" className="h-7 px-3 text-xs border-violet-200 dark:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-950/20 text-violet-600 dark:text-violet-400">
                  Gunakan
                </Button>
              ) : (
                <span className="text-[9px] text-destructive font-medium bg-destructive/10 px-2 py-0.5 rounded-md">
                  Min. Belanja Belum Cukup
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const isVoucher = appliedDiscount?.type === 'voucher';

  return (
    <>
      {/* Trigger Button Interface */}
      {appliedDiscount ? (
        <div className="border border-green-200 dark:border-green-900/50 rounded-xl p-4 bg-green-50/40 dark:bg-green-950/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
              {isVoucher ? <Ticket className="h-5 w-5" /> : <Gift className="h-5 w-5" />}
            </div>
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setIsOpen(true)}>
              <span className="text-[9px] font-bold uppercase tracking-wider text-green-700 dark:text-green-400 block leading-none">
                {isVoucher ? 'Voucher Terpasang' : 'Promo Terpasang'}
              </span>
              <p className="font-mono font-bold text-foreground text-sm mt-1 truncate">{appliedDiscount.code}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Hemat <span className="font-semibold text-green-600 dark:text-green-400">Rp {parseFloat(appliedDiscount.discount).toLocaleString('id-ID')}</span>
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveDiscount();
              }}
              className="text-green-700 hover:text-green-900 hover:bg-green-100 dark:text-green-400 dark:hover:text-green-200 dark:hover:bg-green-900/40 shrink-0 -mt-1 w-7 h-7"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div 
          className="border border-dashed border-primary/40 rounded-xl p-3.5 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 hover:from-primary/10 hover:to-primary/10 transition-all cursor-pointer group" 
          onClick={() => setIsOpen(true)}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                <Tag className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider leading-none">Makin hemat pakai</p>
                <p className="text-sm font-bold text-foreground mt-0.5">Promo atau Voucher</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-primary font-bold">
              Pilih
              <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      )}

      {/* Discount Dialog Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-2xl border bg-background shadow-2xl">
          <DialogHeader className="p-5 pb-4 border-b">
            <div className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              <DialogTitle className="text-lg font-bold text-foreground">Pakai Promo / Voucher</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Gunakan kode promo atau voucher belanja untuk mendapatkan potongan harga.
            </DialogDescription>
          </DialogHeader>

          {/* Manual Input Code */}
          <div className="p-5 py-4 border-b bg-muted/20 space-y-2">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Punya kode diskon khusus?</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Masukkan kode promo atau voucher"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  className="pl-10 uppercase font-mono font-semibold tracking-wide h-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyDiscount()}
                />
              </div>
              <Button 
                onClick={() => handleApplyDiscount()} 
                disabled={loading || !discountCode.trim()}
                className="px-4 h-10 font-bold"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Terapkan'
                )}
              </Button>
            </div>
          </div>

          {/* Available Promos List */}
          <div className="flex-1 overflow-y-auto p-5 py-4 flex flex-col min-h-[300px]">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Promo Tersedia</h4>
            <div className="flex-1 flex flex-col justify-start">
              {fetchingDiscounts ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : promos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground flex flex-col items-center justify-center h-full">
                  <AlertCircle className="h-10 w-10 mb-2 text-muted-foreground/50" />
                  <p className="font-semibold text-sm">Tidak ada promo tersedia</p>
                  <p className="text-xs text-muted-foreground/75 mt-1">Belum ada program promo kampanye saat ini.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {promos.map((item) => renderPromoCard(item))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
