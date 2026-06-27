import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ status: '', search: '', page: 1 });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [filters.status, filters.page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      params.page = filters.page;

      const response = await adminAPI.getOrders(params);
      const data = response.data;
      setOrders(data.data || []);
      setPagination({
        current_page: data.current_page,
        last_page: data.last_page,
        total: data.total,
      });
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, page: 1 }));
    fetchOrders();
  };

  const viewDetail = async (orderId) => {
    try {
      setDetailLoading(true);
      const response = await adminAPI.getOrderDetail(orderId);
      setSelectedOrder(response.data);
    } catch (err) {
      console.error('Error fetching order detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const statusColors = {
    'Menunggu Pembayaran': 'bg-yellow-100 text-yellow-800',
    'Sedang Dikemas': 'bg-blue-100 text-blue-800',
    'Menunggu Pengirim': 'bg-orange-100 text-orange-800',
    'Sedang Dikirim': 'bg-indigo-100 text-indigo-800',
    'Pesanan Selesai': 'bg-green-100 text-green-800',
    'Dikembalikan': 'bg-red-100 text-red-800',
    'Dibatalkan': 'bg-gray-100 text-gray-800',
  };

  const statuses = [
    'Menunggu Pembayaran',
    'Sedang Dikemas',
    'Menunggu Pengirim',
    'Sedang Dikirim',
    'Pesanan Selesai',
    'Dikembalikan',
    'Dibatalkan',
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Monitor Orders</h1>
        <p className="text-muted-foreground mt-1">View and monitor all marketplace orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <Input
            placeholder="Search by order number..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="max-w-xs"
          />
          <Button type="submit" variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value === 'all' ? '' : value, page: 1 }))}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No orders found.
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Order #</th>
                  <th className="px-4 py-3 text-left font-medium">Buyer</th>
                  <th className="px-4 py-3 text-left font-medium">Store</th>
                  <th className="px-4 py-3 text-left font-medium">Total</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Delivery</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{order.order_number}</td>
                    <td className="px-4 py-3">{order.buyer?.name || '-'}</td>
                    <td className="px-4 py-3">{order.store?.store_name || '-'}</td>
                    <td className="px-4 py-3 font-medium">
                      Rp {Math.round(order.total).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className={statusColors[order.status] || ''}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 capitalize">{order.delivery_method?.replace('_', ' ') || '-'}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" onClick={() => viewDetail(order.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Detail</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          ) : selectedOrder ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Order Number</p>
                  <p className="font-mono font-medium">{selectedOrder.order_number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className={statusColors[selectedOrder.status] || ''}>
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Buyer</p>
                  <p className="font-medium">{selectedOrder.buyer?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Store</p>
                  <p className="font-medium">{selectedOrder.store?.store_name || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-medium text-lg">
                    Rp {Math.round(selectedOrder.total).toLocaleString('id-ID')}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Delivery Method</p>
                  <p className="font-medium capitalize">{selectedOrder.delivery_method?.replace('_', ' ')}</p>
                </div>
              </div>

              {/* Order Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Items</h4>
                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-3 py-2 text-left">Product</th>
                          <th className="px-3 py-2 text-right">Price</th>
                          <th className="px-3 py-2 text-right">Qty</th>
                          <th className="px-3 py-2 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedOrder.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-3 py-2">{item.product_name}</td>
                            <td className="px-3 py-2 text-right">
                              Rp {Math.round(item.price).toLocaleString('id-ID')}
                            </td>
                            <td className="px-3 py-2 text-right">{item.quantity}</td>
                            <td className="px-3 py-2 text-right">
                              Rp {Math.round(item.subtotal).toLocaleString('id-ID')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Status History */}
              {selectedOrder.status_histories && selectedOrder.status_histories.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Status History</h4>
                  <div className="space-y-2">
                    {selectedOrder.status_histories.map((hist, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm">
                        <Badge variant="outline" className="text-xs">
                          {hist.status}
                        </Badge>
                        <span className="text-muted-foreground">
                          {hist.created_at ? new Date(hist.created_at).toLocaleString('id-ID') : ''}
                        </span>
                        {hist.note && <span className="text-muted-foreground italic">— {hist.note}</span>}
                      </div>
                    ))}
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
