import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Eye, ChevronLeft, ChevronRight, Store as StoreIcon } from 'lucide-react';

export default function AdminStoresPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedStore, setSelectedStore] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchStores();
  }, [page]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const params = { page };
      if (search) params.search = search;

      const response = await adminAPI.getStores(params);
      const data = response.data;
      setStores(data.data || []);
      setPagination({
        current_page: data.current_page,
        last_page: data.last_page,
        total: data.total,
      });
    } catch (err) {
      console.error('Error fetching stores:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStores();
  };

  const viewDetail = async (storeId) => {
    try {
      setDetailLoading(true);
      const response = await adminAPI.getStoreDetail(storeId);
      setSelectedStore(response.data);
    } catch (err) {
      console.error('Error fetching store detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#003f87] tracking-tight">Monitor Stores</h1>
        <p className="text-muted-foreground mt-1">View all marketplace stores and their details</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <Input
          placeholder="Search store name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-border rounded-sm"
        />
        <Button type="submit" variant="outline" size="icon" className="border-[#003f87] text-[#003f87] rounded-sm">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {/* Stores Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-white border border-border shadow-sm rounded-sm">
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stores.length === 0 ? (
        <Card className="bg-white border border-border shadow-sm rounded-sm">
          <CardContent className="py-10 text-center text-muted-foreground">
            No stores found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <Card key={store.id} className="bg-white border border-border shadow-sm rounded-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-sm bg-[#006b5f]/10">
                      <StoreIcon className="h-4 w-4 text-[#006b5f]" />
                    </div>
                    <div>
                      <CardTitle className="text-base text-foreground">{store.store_name}</CardTitle>
                      <p className="text-xs text-muted-foreground">/{store.slug}</p>
                    </div>
                  </div>
                  <Badge variant={store.is_active ? 'default' : 'secondary'} className={store.is_active ? 'bg-[#006b5f] text-white' : 'bg-muted text-muted-foreground'}>
                    {store.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Owner</span>
                    <span className="font-medium text-foreground">{store.owner?.name || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="text-foreground">{store.phone || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address</span>
                    <span className="text-right max-w-[60%] truncate text-foreground">{store.address || '-'}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4 border-[#003f87] text-[#003f87] hover:bg-[#003f87]/10 rounded-sm"
                  onClick={() => viewDetail(store.id)}
                >
                  <Eye className="h-4 w-4 mr-2" /> View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.current_page} of {pagination.last_page} ({pagination.total} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current_page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="border-[#003f87] text-[#003f87] rounded-sm"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => setPage((p) => p + 1)}
              className="border-[#003f87] text-[#003f87] rounded-sm"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Store Detail Dialog */}
      <Dialog open={!!selectedStore} onOpenChange={() => setSelectedStore(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-sm">
          <DialogHeader>
            <DialogTitle className="text-[#003f87]">Store Detail</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          ) : selectedStore ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Store Name</p>
                  <p className="font-medium text-lg text-foreground">{selectedStore.store_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className={selectedStore.is_active ? 'bg-[#006b5f] text-white' : 'bg-muted text-muted-foreground'}>
                    {selectedStore.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Owner</p>
                  <p className="font-medium text-foreground">{selectedStore.owner?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="text-foreground">{selectedStore.phone || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Description</p>
                  <p className="text-foreground">{selectedStore.description || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Address</p>
                  <p className="text-foreground">{selectedStore.address || '-'}</p>
                </div>
              </div>

              {/* Products */}
              {selectedStore.products && selectedStore.products.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-[#003f87]">Products ({selectedStore.products.length})</h4>
                  <div className="rounded-sm border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-[#eff4ff] border-b border-border">
                        <tr>
                          <th className="px-3 py-2 text-left text-[#003f87]">Name</th>
                          <th className="px-3 py-2 text-right text-[#003f87]">Price</th>
                          <th className="px-3 py-2 text-right text-[#003f87]">Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {selectedStore.products.map((product) => (
                          <tr key={product.id} className="bg-white hover:bg-[#f8f9ff]">
                            <td className="px-3 py-2 text-foreground">{product.name}</td>
                            <td className="px-3 py-2 text-right text-foreground">
                              Rp {Math.round(product.price).toLocaleString('id-ID')}
                            </td>
                            <td className="px-3 py-2 text-right text-foreground">{product.stock}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
