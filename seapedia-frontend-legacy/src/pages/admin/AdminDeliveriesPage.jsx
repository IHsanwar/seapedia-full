import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, ChevronLeft, ChevronRight, Truck } from 'lucide-react';

export default function AdminDeliveriesPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ status: '', method: '', page: 1 });
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchDeliveries();
  }, [filters.status, filters.method, filters.page]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.method) params.method = filters.method;
      params.page = filters.page;

      const response = await adminAPI.getDeliveries(params);
      const data = response.data;
      setDeliveries(data.data || []);
      setPagination({
        current_page: data.current_page,
        last_page: data.last_page,
        total: data.total,
      });
    } catch (err) {
      console.error('Error fetching deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewDetail = async (deliveryId) => {
    try {
      setDetailLoading(true);
      const response = await adminAPI.getDeliveryDetail(deliveryId);
      setSelectedDelivery(response.data);
    } catch (err) {
      console.error('Error fetching delivery detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'in_progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800',
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Monitor Deliveries</h1>
        <p className="text-muted-foreground mt-1">Monitor all active and completed delivery jobs</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value === 'all' ? '' : value, page: 1 }))}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.method}
          onValueChange={(value) => setFilters((prev) => ({ ...prev, method: value === 'all' ? '' : value, page: 1 }))}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="instant">Instant</SelectItem>
            <SelectItem value="next_day">Next Day</SelectItem>
            <SelectItem value="regular">Regular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Deliveries Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : deliveries.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No deliveries found.
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Delivery ID</th>
                  <th className="px-4 py-3 text-left font-medium">Order Number</th>
                  <th className="px-4 py-3 text-left font-medium">Driver</th>
                  <th className="px-4 py-3 text-left font-medium">Method</th>
                  <th className="px-4 py-3 text-left font-medium">Fee</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {deliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">#DEL-{delivery.id}</td>
                    <td className="px-4 py-3 font-mono text-xs">{delivery.order?.order_number || '-'}</td>
                    <td className="px-4 py-3">{delivery.driver?.name || 'Not Assigned'}</td>
                    <td className="px-4 py-3 capitalize">{delivery.method?.replace('_', ' ') || '-'}</td>
                    <td className="px-4 py-3 font-medium">
                      Rp {Math.round(delivery.fee).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className={statusColors[delivery.status] || ''}>
                        {delivery.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {delivery.created_at ? new Date(delivery.created_at).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" onClick={() => viewDetail(delivery.id)}>
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

      {/* Delivery Detail Dialog */}
      <Dialog open={!!selectedDelivery} onOpenChange={() => setSelectedDelivery(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Delivery Detail</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          ) : selectedDelivery ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Delivery ID</p>
                  <p className="font-medium">#DEL-{selectedDelivery.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className={statusColors[selectedDelivery.status] || ''}>
                    {selectedDelivery.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Driver</p>
                  <p className="font-medium">{selectedDelivery.driver?.name || 'Not Assigned'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Delivery Method</p>
                  <p className="font-medium capitalize">{selectedDelivery.method?.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fee</p>
                  <p className="font-medium text-lg">
                    Rp {Math.round(selectedDelivery.fee).toLocaleString('id-ID')}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Order Number</p>
                  <p className="font-mono">{selectedDelivery.order?.order_number || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Taken At</p>
                  <p>{selectedDelivery.taken_at ? new Date(selectedDelivery.taken_at).toLocaleString('id-ID') : '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Completed At</p>
                  <p>{selectedDelivery.completed_at ? new Date(selectedDelivery.completed_at).toLocaleString('id-ID') : '-'}</p>
                </div>
              </div>

              {/* Order summary in delivery */}
              {selectedDelivery.order && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Order Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Buyer:</span> {selectedDelivery.order.buyer?.name || '-'}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Store:</span> {selectedDelivery.order.store?.store_name || '-'}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total:</span> Rp {Math.round(selectedDelivery.order.total).toLocaleString('id-ID')}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status Order:</span> {selectedDelivery.order.status}
                    </div>
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
