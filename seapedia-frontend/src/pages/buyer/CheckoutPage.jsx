import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartAPI } from '../../api/cart';
import { addressAPI } from '../../api/address';
import { walletAPI } from '../../api/wallet';
import { orderAPI } from '../../api/orders';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import {
  ShoppingCart, ArrowLeft, Loader2, MapPin, Truck, Wallet, CheckCircle, AlertCircle, Package, Tag, X
} from 'lucide-react';
import { toast } from 'react-toastify';

const DELIVERY_METHODS = [
  { id: 'instant', name: 'Instant Delivery', description: 'Pengiriman hari ini', fee: 15000, icon: '🚀' },
  { id: 'next_day', name: 'Next Day Delivery', description: 'Pengiriman besok', fee: 10000, icon: '📦' },
  { id: 'regular', name: 'Regular Delivery', description: 'Pengiriman standar', fee: 5000, icon: '🚚' },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [wallet, setWallet] = useState(null);
  
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState('regular');

  // Voucher states
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [applyingVoucher, setApplyingVoucher] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cartRes, addressesRes, walletRes] = await Promise.all([
        cartAPI.getCart(),
        addressAPI.getAddresses(),
        walletAPI.getWalletDetails(),
      ]);
      
      setCart(cartRes?.data || cartRes);
      setAddresses(addressesRes?.data || addressesRes);
      setWallet(walletRes?.data || walletRes);
      
      const defaultAddress = addressesRes?.data?.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    } catch (err) {
      toast.error('Gagal memuat data checkout');
    } finally {
      setLoading(false);
    }
  };

  const selectedDelivery = DELIVERY_METHODS.find(m => m.id === selectedDeliveryMethod);
  const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);

  const calculateTotals = () => {
    if (!cart || !selectedDelivery) return null;
    
    const subtotal = parseFloat(cart?.summary?.subtotal || 0);
    const deliveryFee = selectedDelivery.fee;
    const tax = subtotal * 0.12;
    const total = subtotal + deliveryFee + tax - discount;

    return { subtotal, deliveryFee, discount, tax, total };
  };

  const totals = calculateTotals();
  const hasSufficientBalance = wallet && totals && wallet.balance >= totals.total;

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error('Silakan masukkan kode voucher');
      return;
    }

    if (!cart?.summary?.subtotal) {
      toast.error('Keranjang belanja kosong');
      return;
    }

    setApplyingVoucher(true);
    try {
      const response = await orderAPI.applyVoucher({
        voucher_code: voucherCode.trim(),
        subtotal: cart.summary.subtotal,
      });

      const { voucher, discount: discountAmount } = response.data;
      setAppliedVoucher(voucher);
      setDiscount(discountAmount);
      toast.success(`Voucher berhasil! Anda hemat Rp ${discountAmount.toLocaleString('id-ID')}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal menerapkan voucher';
      toast.error(message);
      setAppliedVoucher(null);
      setDiscount(0);
    } finally {
      setApplyingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setDiscount(0);
    setVoucherCode('');
    toast.info('Voucher dihapus');
  };

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      toast.error('Silakan pilih alamat pengiriman');
      return;
    }

    if (!hasSufficientBalance) {
      toast.error('Saldo dompet tidak mencukupi');
      return;
    }

    setProcessing(true);
    try {
      const checkoutData = {
        address_id: selectedAddressId,
        delivery_method: selectedDeliveryMethod,
      };

      // Add voucher code if applied
      if (appliedVoucher) {
        checkoutData.voucher_code = appliedVoucher.code;
      }

      const res = await orderAPI.checkout(checkoutData);

      toast.success('Pesanan berhasil dibuat!');
      navigate(`/buyer/orders/${res?.data?.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat pesanan');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const items = cart?.items || [];
  const hasItems = items.length > 0;

  if (!hasItems) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link to="/buyer/cart" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" /> Kembali ke Keranjang
        </Link>
        
        <Card className="text-center py-16 border-dashed">
          <CardContent className="space-y-6">
            <div className="bg-primary/10 text-primary w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <ShoppingCart className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Keranjang Anda Kosong</h3>
              <p className="text-muted-foreground">
                Silakan tambahkan produk ke keranjang terlebih dahulu.
              </p>
            </div>
            <Button asChild size="lg" className="px-8">
              <Link to="/products">Cari Produk</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link to="/buyer/cart" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-1" /> Kembali ke Keranjang
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-7 w-7 text-primary" /> Checkout
          </h1>
          <p className="text-muted-foreground">Selesaikan pesanan Anda</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Address Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> Alamat Pengiriman
              </CardTitle>
              <CardDescription>Pilih alamat untuk pengiriman pesanan</CardDescription>
            </CardHeader>
            <CardContent>
              {addresses.length === 0 ? (
                <div className="text-center py-8 space-y-4">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <p className="font-medium">Belum ada alamat</p>
                    <p className="text-sm text-muted-foreground mb-4">Tambahkan alamat pengiriman terlebih dahulu</p>
                  </div>
                  <Button asChild variant="outline">
                    <Link to="/buyer/addresses">Tambah Alamat</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      onClick={() => setSelectedAddressId(address.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedAddressId === address.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{address.recipient_name}</span>
                            {address.is_default && (
                              <Badge variant="secondary" className="text-xs">Utama</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{address.recipient_phone}</p>
                          <p className="text-sm mt-1">{address.address}</p>
                          {address.city && (
                            <p className="text-sm text-muted-foreground">{address.city}, {
                              address.province ? `${address.province} ` : ''
                            }{address.postal_code || ''}</p>
                          )}
                        </div>
                        {selectedAddressId === address.id && (
                          <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery Method Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" /> Metode Pengiriman
              </CardTitle>
              <CardDescription>Pilih metode pengiriman yang diinginkan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {DELIVERY_METHODS.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedDeliveryMethod(method.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedDeliveryMethod === method.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{method.icon}</span>
                          <span className="font-semibold">{method.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          Rp {method.fee.toLocaleString('id-ID')}
                        </p>
                        {selectedDeliveryMethod === method.id && (
                          <CheckCircle className="h-5 w-5 text-primary mx-auto mt-1" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Items Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" /> Ringkasan Pesanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map((item) => {
                  const product = item.product || {};
                  return (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                        {product.thumbnail_image || product.image_url ? (
                          <img
                            src={product.image_url || product.thumbnail_image}
                            alt={product.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className="text-[8px] text-muted-foreground flex items-center justify-center h-full">No Image</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium line-clamp-1">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{item.quantity} x Rp {parseFloat(item.price).toLocaleString('id-ID')}</p>
                      </div>
                      <p className="font-bold">Rp {parseFloat(item.subtotal).toLocaleString('id-ID')}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-4">
          <Card className="shadow-md sticky top-4">
            <CardHeader>
              <CardTitle className="text-xl">Ringkasan Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {totals && (
                <>
                  <div className="space-y-2 text-sm border-b pb-4">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-medium text-foreground">Rp {totals.subtotal.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Biaya Pengiriman</span>
                      <span className="font-medium text-foreground">Rp {totals.deliveryFee.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Diskon</span>
                      <span className={`font-medium ${discount > 0 ? 'text-green-600' : 'text-foreground'}`}>
                        {discount > 0 ? '-' : ''}Rp {(discount || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>PPN (12%)</span>
                      <span className="font-medium text-foreground">Rp {totals.tax.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="font-semibold text-lg">Total Bayar</span>
                    <span className="text-2xl font-bold text-primary">
                      Rp {totals.total.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Wallet Balance */}
                  <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Wallet className="h-4 w-4 text-primary" />
                      <span className="font-medium">Saldo Dompet Anda</span>
                    </div>
                    <p className="text-2xl font-bold">
                      Rp {wallet?.balance ? parseFloat(wallet.balance).toLocaleString('id-ID') : '0'}
                    </p>
                    {!hasSufficientBalance && (
                      <div className="flex items-center gap-2 text-destructive text-sm mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>Saldo tidak mencukupi</span>
                      </div>
                    )}
                  </div>

                  {/* Voucher Section */}
                  <div className="p-4 rounded-lg bg-muted/30 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Tag className="h-4 w-4 text-primary" />
                      <span className="font-medium">Voucher Diskon</span>
                    </div>

                    {appliedVoucher ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="font-medium text-green-800 text-sm">{appliedVoucher.code}</p>
                              <p className="text-xs text-green-600">Hemat Rp {discount.toLocaleString('id-ID')}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveVoucher}
                            className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Masukkan kode voucher"
                            value={voucherCode}
                            onChange={(e) => setVoucherCode(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleApplyVoucher();
                              }
                            }}
                            className="flex-1"
                          />
                          <Button
                            onClick={handleApplyVoucher}
                            disabled={!voucherCode.trim() || applyingVoucher}
                            variant="outline"
                          >
                            {applyingVoucher ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Terapkan'
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleCheckout}
                    disabled={!selectedAddressId || !hasSufficientBalance || processing}
                    className="w-full py-6 text-md font-semibold gap-2 shadow-lg hover:shadow-xl transition-all"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      'Bayar Sekarang'
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}