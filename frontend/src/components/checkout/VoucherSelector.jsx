import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Ticket, 
  Loader2, 
  Tag, 
  Percent, 
  CheckCircle2,
  X,
  AlertCircle
} from 'lucide-react';
import { voucherAPI } from '../../api/vouchers';
import { toast } from 'react-toastify';

export default function VoucherSelector({ subtotal, onApplyVoucher, appliedVoucher, onRemoveVoucher }) {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingVouchers, setFetchingVouchers] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [showVoucherList, setShowVoucherList] = useState(false);

  // Fetch available vouchers
  useEffect(() => {
    if (showVoucherList) {
      fetchAvailableVouchers();
    }
  }, [showVoucherList]);

  const fetchAvailableVouchers = async () => {
    setFetchingVouchers(true);
    try {
      const response = await voucherAPI.getAvailableVouchers();
      setVouchers(response.data || []);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      toast.error('Gagal memuat voucher');
    } finally {
      setFetchingVouchers(false);
    }
  };

  const handleApplyVoucher = async (code = voucherCode) => {
    if (!code.trim()) {
      toast.error('Masukkan kode voucher');
      return;
    }

    setLoading(true);
    try {
      const response = await voucherAPI.applyVoucher(code, subtotal);
      
      if (response.success) {
        onApplyVoucher({
          code: response.data.voucher.code,
          discount: response.data.discount,
          voucher: response.data.voucher,
        });
        toast.success(`Voucher berhasil dipasang! Diskon Rp ${response.data.discount.toLocaleString('id-ID')}`);
        setVoucherCode('');
        setShowVoucherList(false);
      } else {
        toast.error(response.message || 'Gagal menerapkan voucher');
      }
    } catch (error) {
      console.error('Error applying voucher:', error);
      const message = error.response?.data?.message || 'Gagal menerapkan voucher';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    onRemoveVoucher();
    toast.info('Voucher dibatalkan');
  };

  const formatDiscount = (voucher) => {
    if (voucher.type === 'fixed') {
      return `Rp ${parseFloat(voucher.value).toLocaleString('id-ID')}`;
    } else {
      return `${voucher.value}%` + (voucher.max_discount ? ` (max Rp ${parseFloat(voucher.max_discount).toLocaleString('id-ID')})` : '');
    }
  };

  // If voucher is already applied, show applied state
  if (appliedVoucher) {
    return (
      <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-green-800 dark:text-green-200">
                Voucher Berhasil Dipasang!
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Kode: <span className="font-mono font-bold">{appliedVoucher.code}</span>
              </p>
              <p className="text-lg font-bold text-green-800 dark:text-green-200 mt-2">
                Diskon: Rp {parseFloat(appliedVoucher.discount).toLocaleString('id-ID')}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveVoucher}
              className="text-green-700 hover:text-green-900 hover:bg-green-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Ticket className="h-5 w-5 text-primary" />
          Voucher Diskon
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voucher Code Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Masukkan kode voucher"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              className="pl-10 uppercase"
              onKeyDown={(e) => e.key === 'Enter' && handleApplyVoucher()}
            />
          </div>
          <Button 
            onClick={() => handleApplyVoucher()} 
            disabled={loading || !voucherCode.trim()}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Pasang'
            )}
          </Button>
        </div>

        {/* Show Available Vouchers Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowVoucherList(!showVoucherList)}
        >
          {showVoucherList ? 'Sembunyikan' : 'Lihat Voucher Tersedia'}
        </Button>

        {/* Available Vouchers List */}
        {showVoucherList && (
          <div className="border rounded-lg p-4 space-y-3">
            {fetchingVouchers ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : vouchers.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Tidak ada voucher tersedia saat ini</p>
              </div>
            ) : (
              vouchers.map((voucher) => (
                <div
                  key={voucher.id}
                  className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleApplyVoucher(voucher.code)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono">
                          {voucher.code}
                        </Badge>
                        {voucher.type === 'percent' ? (
                          <Percent className="h-3 w-3 text-primary" />
                        ) : (
                          <Tag className="h-3 w-3 text-primary" />
                        )}
                      </div>
                      <p className="text-sm font-medium mt-1">
                        Diskon {formatDiscount(voucher)}
                      </p>
                      {voucher.minimum_purchase > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Min. pembelian Rp {parseFloat(voucher.minimum_purchase).toLocaleString('id-ID')}
                        </p>
                      )}
                    </div>
                    <Button size="sm" variant="outline">
                      Pakai
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
