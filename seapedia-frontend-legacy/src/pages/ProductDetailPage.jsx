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
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="bg-muted/30 rounded-xl p-8 max-w-md mx-auto border">
          <h2 className="text-2xl font-bold mb-4">Oops!</h2>
          <p className="text-muted-foreground mb-6">{error || 'Product not found.'}</p>
          <Button asChild>
            <Link to="/products">Back to Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  const canPurchase = isAuthenticated && activeRole === 'buyer';
  const outOfStock = product.stock <= 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link to="/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to listings
      </Link>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Product Image */}
        <div className="bg-muted rounded-2xl aspect-square overflow-hidden flex items-center justify-center border">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="object-cover w-full h-full" />
          ) : (
            <span className="text-muted-foreground text-lg">No Image Available</span>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            {product.category && <Badge className="mb-3">{product.category}</Badge>}
            <h1 className="text-3xl sm:text-4xl font-bold">{product.name}</h1>
            <p className="text-2xl font-bold text-primary mt-2">
              Rp {parseInt(product.price).toLocaleString('id-ID')}
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground border-y py-4">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <span>Sold by <span className="font-semibold text-foreground">{product.seller?.name || product.store?.store_name || 'Unknown Seller'}</span></span>
            {product.store?.slug && (
              <Button variant="link" asChild className="p-0 h-auto text-sm">
                <Link to={`/stores/${product.store.slug}`}>View Store</Link>
              </Button>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed">
              {product.description || 'No description provided.'}
            </p>
          </div>

          <div className="pt-6">
            {!isAuthenticated ? (
              <div className="bg-muted p-4 rounded-lg text-center">
                <p className="text-sm mb-3">Please login to purchase this item</p>
                <Button asChild className="w-full">
                  <Link to="/login">Login</Link>
                </Button>
              </div>
            ) : !canPurchase ? (
              <div className="bg-muted p-4 rounded-lg text-center text-sm text-muted-foreground">
                <p>Switch to <strong className="text-foreground">Buyer</strong> role to purchase items.</p>
              </div>
            ) : outOfStock ? (
              <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-center text-sm font-semibold">
                Stok Habis
              </div>
            ) : (
              <div className="space-y-4">
                {/* Quantity selector */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-muted-foreground">Jumlah:</span>
                  <div className="flex items-center border rounded-lg overflow-hidden h-10 bg-card">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || adding}
                      className="rounded-none hover:bg-muted"
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
                      className="rounded-none hover:bg-muted"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-xs text-muted-foreground">Tersedia {product.stock} stok</span>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <Button variant="outline" size="lg" className="w-full" onClick={handleAddToCart} disabled={adding}>
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
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" /> Ganti Keranjang Belanja?
              </CardTitle>
              <CardDescription>
                Peringatan Aturan Single-Store Checkout
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Keranjang Anda saat ini berisi produk dari toko <strong className="font-semibold text-foreground">"{conflictStoreName}"</strong>.
                Anda hanya dapat membeli produk dari satu toko dalam satu waktu.
              </p>
              <p className="text-sm font-medium text-foreground">
                Apakah Anda ingin mengosongkan keranjang saat ini dan mulai berbelanja di toko <strong className="text-primary">"{product.seller?.name || product.store?.store_name || 'Toko Baru'}"</strong>?
              </p>
              <div className="flex gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowConflictModal(false)}
                  disabled={adding}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button 
                  type="button"
                  onClick={handleClearAndAdd}
                  disabled={adding}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
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
  );
}
