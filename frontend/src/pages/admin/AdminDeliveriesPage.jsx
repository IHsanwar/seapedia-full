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
    'pending': 'bg-[#115cb9]/10 text-[#115cb9]',
    'in_progress': 'bg-[#006b5f]/10 text-[#006b5f]',
    'completed': 'bg-green-100 text-green-700',
    'cancelled': 'bg-[#ba1a1a]/10 text-[#ba1a1a]',
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#003f87] tracking-tight">Monitor Deliveries</h1>
        <p className="text-muted-foreground mt-1">Monitor all active and completed delivery jobs</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value === 'all' ? '' : value, page: 1 }))}
        >
          <SelectTrigger className="w-[200px] border-border rounded-sm">
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
          <SelectTrigger className="w-[200px] border-border rounded-sm">
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
        <Card className="bg-white border border-border shadow-sm rounded-sm">
          <CardContent className="py-10 text-center text-muted-foreground">
            No deliveries found.
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-sm border border-border overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#eff4ff] border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-[#003f87]">Delivery ID</th>
                  <th className="px-4 py-3 text-left font-medium text-[#003f87]">Order Number</th>
                  <th className="px-4 py-3 text-left font-medium text-[#003f87]">Driver</th>
                  <th className="px-4 py-3 text-left font-medium text-[#003f87]">Method</th>
                  <th className="px-4 py-3 text-left font-medium text-[#003f87]">Fee</th>
                  <th className="px-4 py-3 text-left font-medium text-[#003f87]">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-[#003f87]">Date</th>
                  <th className="px-4 py-3 text-right font-medium text-[#003f87]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {deliveries.map((delivery) => (
                  <tr key={delivery.id} className="bg-white hover:bg-[#f8f9ff] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-foreground">#DEL-{delivery.id}</td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{delivery.order?.order_number || '-'}</td>
                    <td className="px-4 py-3 text-foreground">{delivery.driver?.name || 'Not Assigned'}</td>
                    <td className="px-4 py-3 capitalize text-foreground">{delivery.method?.replace('_', ' ') || '-'}</td>
                    <td className="px-4 py-3 font-medium text-foreground">
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
                      <Button variant="ghost" size="icon" onClick={() => viewDetail(delivery.id)} className="text-[#003f87]">
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
              className="border-[#003f87] text-[#003f87] rounded-sm"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
              className="border-[#003f87] text-[#003f87] rounded-sm"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delivery Detail Dialog */}
      <Dialog open={!!selectedDelivery} onOpenChange={() => setSelectedDelivery(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-sm">
          <DialogHeader>
            <DialogTitle className="text-[#003f87]">Delivery Detail</DialogTitle>
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
                  <p className="font-medium text-foreground">#DEL-{selectedDelivery.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className={statusColors[selectedDelivery.status] || ''}>
                    {selectedDelivery.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Driver</p>
                  <p className="font-medium text-foreground">{selectedDelivery.driver?.name || 'Not Assigned'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Delivery Method</p>
                  <p className="font-medium capitalize text-foreground">{selectedDelivery.method?.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fee</p>
                  <p className="font-medium text-lg text-foreground">
                    Rp {Math.round(selectedDelivery.fee).toLocaleString('id-ID')}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Order Number</p>
                  <p className="font-mono text-foreground">{selectedDelivery.order?.order_number || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Taken At</p>
                  <p className="text-foreground">{selectedDelivery.taken_at ? new Date(selectedDelivery.taken_at).toLocaleString('id-ID') : '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Completed At</p>
                  <p className="text-foreground">{selectedDelivery.completed_at ? new Date(selectedDelivery.completed_at).toLocaleString('id-ID') : '-'}</p>
                </div>
              </div>

              {/* Order summary in delivery */}
              {selectedDelivery.order && (
                <div className="border-t border-border pt-4">
                  <h4 className="font-medium mb-2 text-[#003f87]">Order Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Buyer:</span> <span className="text-foreground">{selectedDelivery.order.buyer?.name || '-'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Store:</span> <span className="text-foreground">{selectedDelivery.order.store?.store_name || '-'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total:</span> <span className="text-foreground">Rp {Math.round(selectedDelivery.order.total).toLocaleString('id-ID')}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status Order:</span> <span className="text-foreground">{selectedDelivery.order.status}</span>
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
