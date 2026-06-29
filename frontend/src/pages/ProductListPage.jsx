import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../api/products';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Loader2, Search } from 'lucide-react';
import { Input } from '../components/ui/input';

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productsAPI.getProducts();

        // Support both paginated ({ data: { data: [...] } }) and direct array ({ data: [...] })
        const items = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
          ? res.data
          : [];

        setProducts(items);
      } catch (err) {
        setError('Failed to load products. ' + (err.response?.data?.message || err.message));
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      (product.category && product.category.toLowerCase().includes(query)) ||
      (product.store?.store_name &&
  product.store.store_name.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-[#f8f9ff]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-foreground">All Products</h1>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              className="pl-9 border-border bg-background rounded-sm" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#006b5f]" />
          </div>
        ) : error ? (
          <div className="bg-[#722b00]/10 text-[#722b00] p-4 rounded-sm text-center">
            {error}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white border border-border border-dashed rounded-sm">
            <h3 className="text-xl font-semibold text-foreground mb-2">No Products Found</h3>
            <p className="text-sm text-muted-foreground">Try a different search query or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="bg-white border border-border shadow-sm rounded-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-square overflow-hidden bg-muted relative">
                  {product.thumbnail_image ? (
                  <img
                    src={product.thumbnail_image}
                    alt={product.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      src="/contoh.png"
                      alt="No Image"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                  {product.category && (
                    <Badge className="absolute top-2 right-2 bg-[#003f87] text-white">
                      {product.category}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg text-foreground line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">Seller: {product.store?.store_name || 'Unknown'}</p>
                  <p className="font-bold text-lg text-[#003f87]">
                    Rp {parseInt(product.price).toLocaleString('id-ID')}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button className="w-full bg-[#006b5f] hover:bg-[#005a50] text-white rounded-sm" asChild>
                    <Link to={`/products/${product.url_slug || product.id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
