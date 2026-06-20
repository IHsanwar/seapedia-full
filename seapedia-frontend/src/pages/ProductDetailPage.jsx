import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsAPI } from '../api/products';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Loader2, ShoppingCart, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function ProductDetailPage() {
  const { productSlug } = useParams();
  const { isAuthenticated, activeRole } = useAuth();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
            ) : (
              <div className="flex gap-4">
                <Button className="flex-1" size="lg">
                  Buy Now
                </Button>
                <Button variant="outline" size="lg">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
