import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsAPI } from '../api/products';
import { cartAPI } from '../api/cart';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Loader2, ShoppingCart, ShieldCheck, ArrowLeft, Plus, Minus } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ProductDetailPage() {
  const { productSlug } = useParams();
  const { isAuthenticated, activeRole } = useAuth();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictStoreName, setConflictStoreName] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productsAPI.getProductBySlug(productSlug);
        setProduct(res.data || res);
      } catch (err) {
        setError('Product not found or API not ready. ' + (err.response?.data?.message || ''));
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [productSlug]);

  const handleAddToCart = async () => {
    if (quantity > product.stock) {
      toast.warning(`Stok tidak mencukupi. Maksimal stok: ${product.stock}`);
      return;
    }

    setAdding(true);
    try {
      await cartAPI.addToCart(product.id, quantity);
      toast.success('Produk berhasil ditambahkan ke keranjang!');
    } catch (err) {
      const errorData = err.response?.data?.errors;
      const message = err.response?.data?.message;
      if (errorData?.conflict_store_name || (message && message.includes('already contains products from'))) {
        setConflictStoreName(errorData?.conflict_store_name || 'toko lain');
        setShowConflictModal(true);
      } else {
        toast.error(message || 'Gagal menambahkan produk ke keranjang');
      }
    } finally {
      setAdding(false);
    }
  };

  const handleClearAndAdd = async () => {
    setAdding(true);
    setShowConflictModal(false);
    try {
      await cartAPI.clearCart();
      await cartAPI.addToCart(product.id, quantity);
      toast.success('Keranjang dikosongkan dan produk berhasil ditambahkan!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan produk');
    } finally {
      setAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#006b5f]" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#f8f9ff]">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-sm p-8 max-w-md mx-auto border border-border">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Oops!</h2>
            <p className="text-muted-foreground mb-6">{error || 'Product not found.'}</p>
            <Button asChild className="bg-[#006b5f] hover:bg-[#005a50] text-white rounded-sm">
              <Link to="/products">Back to Products</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const canPurchase = isAuthenticated && activeRole === 'buyer';
  const outOfStock = product.stock <= 0;

  return (
    <div className="min-h-screen bg-[#f8f9ff]">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link to="/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-[#006b5f] mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to listings
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Product Image */}
          <div className="bg-white rounded-sm aspect-square overflow-hidden flex items-center justify-center border border-border shadow-sm">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src="/contoh.png"
                  alt="No Image"
                  className="object-cover w-full h-full"
                />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              {product.category && <Badge className="mb-3 bg-[#003f87] text-white">{product.category}</Badge>}
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">{product.name}</h1>
              <p className="text-3xl font-bold text-[#003f87] mt-2">
                Rp {parseInt(product.price).toLocaleString('id-ID')}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground border-y border-border py-4">
              <ShieldCheck className="h-5 w-5 text-[#006b5f]" />
              <span>Sold by <span className="font-semibold text-foreground">{product.seller?.name || product.store?.store_name || 'Unknown Seller'}</span></span>
              {product.store?.slug && (
                <Button variant="link" asChild className="p-0 h-auto text-sm text-[#003f87] hover:text-[#006b5f]">
                  <Link to={`/stores/${product.store.slug}`}>View Store</Link>
                </Button>
              )}
            </div>

            <div className="bg-white border border-border rounded-sm p-4">
              <h3 className="font-semibold mb-2 text-foreground">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description || 'No description provided.'}
              </p>
            </div>

            <div className="pt-6">
              {!isAuthenticated ? (
                <div className="bg-white border border-border p-4 rounded-sm text-center">
                  <p className="text-sm mb-3 text-muted-foreground">Please login to purchase this item</p>
                  <Button asChild className="w-full bg-[#006b5f] hover:bg-[#005a50] text-white rounded-sm">
                    <Link to="/login">Login</Link>
                  </Button>
                </div>
              ) : !canPurchase ? (
                <div className="bg-white border border-border p-4 rounded-sm text-center text-sm text-muted-foreground">
                  <p>Switch to <strong className="text-foreground">Buyer</strong> role to purchase items.</p>
                </div>
              ) : outOfStock ? (
                <div className="bg-[#722b00]/10 text-[#722b00] p-4 rounded-sm text-center text-sm font-semibold">
                  Stok Habis
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Quantity selector */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-muted-foreground">Jumlah:</span>
                    <div className="flex items-center border border-border rounded-sm overflow-hidden h-10 bg-white">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        disabled={quantity <= 1 || adding}
                        className="rounded-none hover:bg-[#f8f9ff]"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center text-sm font-semibold select-none">
                        {quantity}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                        disabled={quantity >= product.stock || adding}
                        className="rounded-none hover:bg-[#f8f9ff]"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <span className="text-xs text-muted-foreground">Tersedia {product.stock} stok</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4">
                    <Button 
                      size="lg" 
                      className="w-full bg-[#006b5f] hover:bg-[#005a50] text-white rounded-sm" 
                      onClick={handleAddToCart} 
                      disabled={adding}
                    >
                      {adding ? (
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      ) : (
                        <ShoppingCart className="h-5 w-5 mr-2" />
                      )}
                      Add to Cart
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cart Store Conflict Modal */}
        {showConflictModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md shadow-2xl bg-white border border-border rounded-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <ShoppingCart className="h-5 w-5 text-[#006b5f]" /> Ganti Keranjang Belanja?
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Peringatan Aturan Single-Store Checkout
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Keranjang Anda saat ini berisi produk dari toko <strong className="font-semibold text-foreground">"{conflictStoreName}"</strong>.
                  Anda hanya dapat membeli produk dari satu toko dalam satu waktu.
                </p>
                <p className="text-sm font-medium text-foreground">
                  Apakah Anda ingin mengosongkan keranjang saat ini dan mulai berbelanja di toko <strong className="text-[#003f87]">"{product.seller?.name || product.store?.store_name || 'Toko Baru'}"</strong>?
                </p>
                <div className="flex gap-3 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowConflictModal(false)}
                    disabled={adding}
                    className="flex-1 border-border text-foreground hover:bg-[#f8f9ff] rounded-sm"
                  >
                    Batal
                  </Button>
                  <Button 
                    type="button"
                    onClick={handleClearAndAdd}
                    disabled={adding}
                    className="flex-1 bg-[#006b5f] text-white hover:bg-[#005a50] rounded-sm"
                  >
                    {adding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Kosongkan & Tambah
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
