import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cartAPI } from '../../api/cart';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  ShoppingCart, ArrowLeft, Trash2, Plus, Minus, Loader2, Store, AlertTriangle, ArrowRight
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // stores item ID currently being updated/deleted

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await cartAPI.getCart();
      setCart(res?.data || res);
    } catch (err) {
      toast.error('Gagal memuat keranjang belanja');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, currentQty, stock, increment) => {
    const newQty = increment ? currentQty + 1 : currentQty - 1;
    
    if (newQty < 1) return;
    if (newQty > stock) {
      toast.warning(`Stok tidak mencukupi. Maksimal stok: ${stock}`);
      return;
    }

    setActionLoading(itemId);
    try {
      const res = await cartAPI.updateQuantity(itemId, newQty);
      setCart(res?.data || res);
      toast.success('Jumlah berhasil diperbarui');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah jumlah');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini dari keranjang?')) return;

    setActionLoading(itemId);
    try {
      const res = await cartAPI.removeFromCart(itemId);
      setCart(res?.data || res);
      toast.success('Produk berhasil dihapus dari keranjang');
    } catch (err) {
      toast.error('Gagal menghapus produk dari keranjang');
    } finally {
      setActionLoading(null);
    }
  };

  const handleClearCart = async () => {
    if (!confirm('Apakah Anda yakin ingin mengosongkan keranjang belanja Anda?')) return;

    setLoading(true);
    try {
      const res = await cartAPI.clearCart();
      setCart(res?.data || res);
      toast.success('Keranjang berhasil dikosongkan');
    } catch (err) {
      toast.error('Gagal mengosongkan keranjang');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    toast.info('Fitur Checkout & Pembayaran akan diimplementasikan pada Milestone berikutnya!');
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
  const storeName = cart?.store?.store_name || '';

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link to="/buyer/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-1" /> Kembali ke dashboard
      </Link>

      <div className="flex flex-col gap-6">
        {/* Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-7 w-7 text-primary" /> Keranjang Belanja
            </h1>
            <p className="text-muted-foreground">Kelola produk pilihan sebelum melakukan checkout</p>
          </div>
          {hasItems && (
            <Button variant="outline" size="sm" onClick={handleClearCart} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Kosongkan Keranjang
            </Button>
          )}
        </div>

        {!hasItems ? (
          <Card className="text-center py-16 border-dashed">
            <CardContent className="space-y-6">
              <div className="bg-primary/10 text-primary w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <ShoppingCart className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Keranjang Anda Kosong</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Jelajahi berbagai produk terbaik di SEAPEDIA dan tambahkan ke keranjang Anda untuk mulai berbelanja.
                </p>
              </div>
              <Button asChild size="lg" className="px-8">
                <Link to="/products">Cari Produk</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-6">
              {/* Single Store Info Warning */}
              <div className="flex items-start gap-3 p-4 rounded-xl border bg-yellow-50/50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900 text-yellow-800 dark:text-yellow-200">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold">Aturan Single-Store Checkout</p>
                  <p className="opacity-90">
                    Keranjang belanja hanya dapat memuat produk dari satu toko. Saat ini keranjang Anda terkunci pada produk dari toko <strong className="font-bold">{storeName}</strong>. Untuk membeli produk dari toko lain, Anda harus menyelesaikan transaksi ini atau mengosongkan keranjang terlebih dahulu.
                  </p>
                </div>
              </div>

              {/* Store Header */}
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border font-medium">
                <Store className="h-4 w-4 text-primary" />
                <span>Belanja dari: <strong className="text-primary">{storeName}</strong></span>
              </div>

              {/* Items */}
              <div className="space-y-4">
                {items.map((item) => {
                  const product = item.product || {};
                  const isUpdating = actionLoading === item.id;

                  return (
                    <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          {/* Image */}
                          <div className="w-20 h-20 rounded-xl bg-muted border overflow-hidden shrink-0 flex items-center justify-center">
                            {product.thumbnail_image || product.image_url ? (
                              <img
                                src={product.image_url || product.thumbnail_image}
                                alt={product.name}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <span className="text-[10px] text-muted-foreground">No Image</span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="space-y-1">
                            <h3 className="font-semibold text-lg line-clamp-1">
                              <Link to={`/products/${product.url_slug || product.slug}`} className="hover:text-primary transition-colors">
                                {product.name}
                              </Link>
                            </h3>
                            <p className="text-primary font-bold">
                              Rp {parseFloat(item.price).toLocaleString('id-ID')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Tersedia {product.stock} stok
                            </p>
                          </div>
                        </div>

                        {/* Quantity and Delete controls */}
                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                          {/* Quantity Selector */}
                          <div className="flex items-center border rounded-lg overflow-hidden h-9 bg-card">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity, product.stock, false)}
                              disabled={item.quantity <= 1 || isUpdating}
                              className="h-full rounded-none hover:bg-muted"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-12 text-center text-sm font-semibold select-none">
                              {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto text-muted-foreground" /> : item.quantity}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity, product.stock, true)}
                              disabled={item.quantity >= product.stock || isUpdating}
                              className="h-full rounded-none hover:bg-muted"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Item Subtotal & Delete */}
                          <div className="flex items-center gap-4 text-right">
                            <div className="hidden sm:block">
                              <p className="text-xs text-muted-foreground">Subtotal</p>
                              <p className="font-bold text-foreground">
                                Rp {parseFloat(item.subtotal).toLocaleString('id-ID')}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={isUpdating}
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive h-9 w-9 rounded-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="space-y-4">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl">Ringkasan Belanja</CardTitle>
                  <CardDescription>Detail belanjaan Anda</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm border-b pb-4">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Total Jenis Produk</span>
                      <span className="font-medium text-foreground">{cart?.summary?.total_items} item</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Total Barang</span>
                      <span className="font-medium text-foreground">{cart?.summary?.total_quantity} pcs</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="font-semibold text-lg">Total Harga</span>
                    <span className="text-xl font-bold text-primary">
                      Rp {parseFloat(cart?.summary?.subtotal || 0).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <Button onClick={handleCheckout} className="w-full py-6 text-md font-semibold gap-2 shadow-lg hover:shadow-xl transition-all">
                    Lanjut ke Pembayaran <ArrowRight className="h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
              
              <div className="p-4 rounded-xl border bg-muted/30 text-xs text-muted-foreground leading-relaxed">
                <p className="font-semibold text-foreground mb-1">Informasi Pajak & Pengiriman:</p>
                <p>
                  Biaya pengiriman dan Pajak (PPN 12%) akan dihitung di halaman pembayaran setelah Anda memilih alamat pengiriman dan metode pengiriman.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
