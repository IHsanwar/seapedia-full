import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsAPI } from '../api/products';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Loader2, Store, Phone, MapPin, Package, ArrowLeft } from 'lucide-react';

export default function StoreDetailPage() {
  const { storeSlug } = useParams();
  const [store, setStore] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await productsAPI.getStoreBySlug(storeSlug);
        setStore(res.data || res);
      } catch (err) {
        setError('Store not found or API not ready. ' + (err.response?.data?.message || ''));
      } finally {
        setIsLoading(false);
      }
    };
    fetchStore();
  }, [storeSlug]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spinr text-primary" />
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="bg-muted/30 rounded-xl p-8 max-w-md mx-auto border">
          <h2 className="text-2xl font-bold mb-4">Oops!</h2>
          <p className="text-muted-foreground mb-6">{error || 'Store not found.'}</p>
          <Button asChild>
            <Link to="/products">Back to Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link to="/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to products
      </Link>

      {/* Store Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 md:p-8 mb-8 border">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-background rounded-xl overflow-hidden border shadow-sm flex-shrink-0">
            {store.logo ? (
              <img src={store.logo} alt={store.store_name} className="object-cover w-full h-full" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Store className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-3xl font-bold">{store.store_name}</h1>
              {store.owner && (
                <p className="text-sm text-muted-foreground mt-1">
                  Owned by <span className="font-medium">{store.owner.name}</span>
                </p>
              )}
            </div>
            
            {store.description && (
              <p className="text-muted-foreground leading-relaxed">{store.description}</p>
            )}
            
            <div className="flex flex-wrap gap-4 text-sm">
              {store.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{store.phone}</span>
                </div>
              )}
              {store.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="line-clamp-1 max-w-md">{store.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Store Products */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Package className="h-5 w-5" />
          <h2 className="text-2xl font-bold">Products</h2>
          {store.products && (
            <Badge variant="secondary">{store.products.length} items</Badge>
          )}
        </div>

        {!store.products || store.products.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-muted-foreground mb-2">No Products Yet</h3>
            <p className="text-sm text-muted-foreground">This store hasn't listed any products yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {store.products.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-square overflow-hidden bg-muted relative">
                  {product.thumbnail_image ? (
                    <img
                      src={product.thumbnail_image}
                      alt={product.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                  <p className="font-bold text-lg text-primary mt-2">
                    Rp {parseInt(product.price).toLocaleString('id-ID')}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Stock: {product.stock} available
                  </p>
                </CardContent>
                <div className="p-4 pt-0">
                  <Button variant="secondary" className="w-full" asChild>
                    <Link to={`/products/${product.url_slug}`}>View Details</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
