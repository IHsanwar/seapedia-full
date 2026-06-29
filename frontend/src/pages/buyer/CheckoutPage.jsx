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
import DiscountSelector from '../../components/checkout/DiscountSelector';

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
  
  // Discount states
  const [appliedDiscount, setAppliedDiscount] = useState(null);

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
    const discount = appliedDiscount?.discount || 0;
    const tax = subtotal * 0.12;
    const total = subtotal + deliveryFee + tax - discount;
    
    return { subtotal, deliveryFee, discount, tax, total };
  };

  const totals = calculateTotals();
  const hasSufficientBalance = wallet && totals && wallet.balance >= totals.total;

  const handleApplyDiscount = (discount) => {
    setAppliedDiscount(discount);
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
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

      // Add discount code if applied
      if (appliedDiscount) {
        if (appliedDiscount.type === 'voucher') {
          checkoutData.voucher_code = appliedDiscount.code;
        } else if (appliedDiscount.type === 'promo') {
          checkoutData.promo_code = appliedDiscount.code;
        }
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
        <Loader2 className="h-8 w-8 animate-spin text-[#006b5f]" />
      </div>
    );
  }

  const items = cart?.items || [];
  const hasItems = items.length > 0;

  if (!hasItems) {
    return (
      <div className="min-h-screen bg-[#f8f9ff]">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Link to="/buyer/cart" className="inline-flex items-center text-sm text-[#003f87] hover:text-[#006b5f] mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" /> Kembali ke Keranjang
          </Link>
          
          <Card className="text-center py-16 border-dashed bg-white border border-border shadow-sm">
            <CardContent className="space-y-6">
              <div className="bg-[#006b5f]/10 text-[#006b5f] w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <ShoppingCart className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-[#003f87]">Keranjang Anda Kosong</h3>
                <p className="text-gray-600">
                  Silakan tambahkan produk ke keranjang terlebih dahulu.
                </p>
              </div>
              <Button asChild size="lg" className="px-8 bg-[#006b5f] hover:bg-[#005a50]">
                <Link to="/products">Cari Produk</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff]">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link to="/buyer/cart" className="inline-flex items-center text-sm text-[#003f87] hover:text-[#006b5f] mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" /> Kembali ke Keranjang
        </Link>
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 text-[#003f87]">
              <Package className="h-7 w-7 text-[#006b5f]" /> Checkout
            </h1>
            <p className="text-gray-600">Selesaikan pesanan Anda</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Address Selection */}
            <Card className="bg-white border border-border shadow-sm rounded-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#003f87]">
                  <MapPin className="h-5 w-5 text-[#006b5f]" /> Alamat Pengiriman
                </CardTitle>
                <CardDescription>Pilih alamat untuk pengiriman pesanan</CardDescription>
              </CardHeader>
              <CardContent>
                {addresses.length === 0 ? (
                  <div className="text-center py-8 space-y-4">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="font-medium text-[#003f87]">Belum ada alamat</p>
                      <p className="text-sm text-gray-500 mb-4">Tambahkan alamat pengiriman terlebih dahulu</p>
                    </div>
                    <Button asChild variant="outline" className="border-[#003f87] text-[#003f87]">
                      <Link to="/buyer/addresses">Tambah Alamat</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        onClick={() => setSelectedAddressId(address.id)}
                        className={`p-4 rounded-sm border-2 cursor-pointer transition-all bg-white ${
                          selectedAddressId === address.id
                            ? 'border-[#006b5f] ring-1 ring-[#006b5f]'
                            : 'border-border hover:border-[#006b5f]/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-[#003f87]">{address.recipient_name}</span>
                              {address.is_default && (
                                <Badge variant="secondary" className="text-xs bg-[#006b5f]/10 text-[#006b5f]">Utama</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{address.recipient_phone}</p>
                            <p className="text-sm mt-1">{address.address}</p>
                            {address.city && (
                              <p className="text-sm text-gray-500">{address.city}, {
                                address.province ? `${address.province} ` : ''
                              }{address.postal_code || ''}</p>
                            )}
                          </div>
                          {selectedAddressId === address.id && (
                            <CheckCircle className="h-5 w-5 text-[#006b5f] shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delivery Method Selection */}
            <Card className="bg-white border border-border shadow-sm rounded-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#003f87]">
                  <Truck className="h-5 w-5 text-[#006b5f]" /> Metode Pengiriman
                </CardTitle>
                <CardDescription>Pilih metode pengiriman yang diinginkan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {DELIVERY_METHODS.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setSelectedDeliveryMethod(method.id)}
                      className={`p-4 rounded-sm border-2 cursor-pointer transition-all bg-white ${
                        selectedDeliveryMethod === method.id
                          ? 'border-[#006b5f] ring-1 ring-[#006b5f]'
                          : 'border-border hover:border-[#006b5f]/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">{method.icon}</span>
                            <span className="font-semibold text-[#003f87]">{method.name}</span>
                          </div>
                          <p className="text-sm text-gray-500">{method.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#003f87]">
                            Rp {method.fee.toLocaleString('id-ID')}
                          </p>
                          {selectedDeliveryMethod === method.id && (
                            <CheckCircle className="h-5 w-5 text-[#006b5f] mx-auto mt-1" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Items Summary */}
            <Card className="bg-white border border-border shadow-sm rounded-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#003f87]">
                  <ShoppingCart className="h-5 w-5 text-[#006b5f]" /> Ringkasan Pesanan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {items.map((item) => {
                    const product = item.product || {};
                    return (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-[#f8f9ff] rounded-sm border border-border">
                        <div className="w-16 h-16 rounded-sm bg-white border border-border overflow-hidden shrink-0">
                          {product.thumbnail_image || product.image_url ? (
                            <img
                              src={product.image_url || product.thumbnail_image}
                              alt={product.name}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <img
                              src="/contoh.png"
                              alt="Product"
                              className="object-cover w-full h-full opacity-50"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-[#003f87]">{product.name}</p>
                          <p className="text-sm text-gray-500">{item.quantity} x Rp {parseFloat(item.price).toLocaleString('id-ID')}</p>
                        </div>
                        <p className="font-bold text-[#003f87]">Rp {parseFloat(item.subtotal).toLocaleString('id-ID')}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            <Card className="shadow-md sticky top-4 bg-white border border-border rounded-sm">
              <CardHeader>
                <CardTitle className="text-xl text-[#003f87]">Ringkasan Pembayaran</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {totals && (
                  <>
                    <div className="space-y-2 text-sm border-b border-border pb-4">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-medium text-[#003f87]">Rp {totals.subtotal.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Biaya Pengiriman</span>
                        <span className="font-medium text-[#003f87]">Rp {totals.deliveryFee.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Diskon</span>
                        <span className={`font-medium ${totals.discount > 0 ? 'text-[#006b5f]' : 'text-[#003f87]'}`}>
                          {totals.discount > 0 ? '-' : ''}Rp {(totals.discount || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>PPN (12%)</span>
                        <span className="font-medium text-[#003f87]">Rp {totals.tax.toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="font-semibold text-lg text-[#003f87]">Total Bayar</span>
                      <span className="text-2xl font-bold text-[#003f87]">
                        Rp {totals.total.toLocaleString('id-ID')}
                      </span>
                    </div>

                    {/* Wallet Balance */}
                    <div className="p-4 rounded-sm bg-[#f8f9ff] border border-border space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Wallet className="h-4 w-4 text-[#006b5f]" />
                        <span className="font-medium text-[#003f87]">Saldo Dompet Anda</span>
                      </div>
                      <p className="text-2xl font-bold text-[#003f87]">
                        Rp {wallet?.balance ? parseFloat(wallet.balance).toLocaleString('id-ID') : '0'}
                      </p>
                      {!hasSufficientBalance && (
                        <div className="flex items-center gap-2 text-[#ba1a1a] text-sm mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <span>Saldo tidak mencukupi</span>
                        </div>
                      )}
                    </div>

                    {/* Discount Section */}
                    <DiscountSelector
                      subtotal={cart?.summary?.subtotal || 0}
                      onApplyDiscount={handleApplyDiscount}
                      appliedDiscount={appliedDiscount}
                      onRemoveDiscount={handleRemoveDiscount}
                    />

                    {/* Checkout Button */}
                    <Button
                      onClick={handleCheckout}
                      disabled={!selectedAddressId || !hasSufficientBalance || processing}
                      className="w-full py-6 text-md font-semibold gap-2 bg-[#006b5f] hover:bg-[#005a50] shadow-lg hover:shadow-xl transition-all"
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
    </div>
  );
}
