import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertTriangle, Clock, RefreshCw, Undo } from 'lucide-react';

export default function AdminOverduePage() {
  const [overdueData, setOverdueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);
  const [simulateHours, setSimulateHours] = useState('24');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchOverdueOrders();
  }, []);

  const fetchOverdueOrders = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getOverdueOrders();
      setOverdueData(response.data);
    } catch (err) {
      console.error('Error fetching overdue orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessAll = async () => {
    if (!window.confirm('Are you sure you want to process and refund all overdue orders?')) return;
    try {
      setProcessing(true);
      const response = await adminAPI.processAllOverdue();
      setMessage({
        type: 'success',
        text: `Successfully processed ${response.data.processed} orders. Errors: ${response.data.errors}`,
      });
      fetchOverdueOrders();
    } catch (err) {
      console.error('Error processing overdue orders:', err);
      setMessage({ type: 'error', text: 'Failed to process overdue orders.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleRefundSingle = async (orderId) => {
    if (!window.confirm('Are you sure you want to refund this order?')) return;
    try {
      setProcessing(true);
      const response = await adminAPI.refundOverdueOrder(orderId);
      setMessage({
        type: 'success',
        text: `Order #${response.data.order_number} refunded successfully.`,
      });
      fetchOverdueOrders();
    } catch (err) {
      console.error('Error refunding order:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to refund order.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleSimulate = async () => {
    try {
      setProcessing(true);
      setIsSimulateOpen(false);
      const response = await adminAPI.simulateNextDay(parseInt(simulateHours));
      setMessage({
        type: 'success',
        text: `Simulated ${simulateHours} hours. Processed ${response.data.processed} orders that became overdue.`,
      });
      fetchOverdueOrders();
    } catch (err) {
      console.error('Error simulating time:', err);
      setMessage({ type: 'error', text: 'Failed to simulate time forward.' });
    } finally {
      setProcessing(false);
    }
  };

  const statusColors = {
    'Menunggu Pengirim': 'bg-[#722b00]/10 text-[#722b00]',
    'Sedang Dikirim': 'bg-[#006b5f]/10 text-[#006b5f]',
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#003f87] tracking-tight">Overdue SLA Handling</h1>
          <p className="text-muted-foreground mt-1">Manage and resolve orders that have exceeded their SLA limits</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setIsSimulateOpen(true)} disabled={processing} className="border-[#003f87] text-[#003f87] rounded-sm">
            <Clock className="h-4 w-4 mr-2" /> Simulate Next Day
          </Button>
          <Button variant="outline" onClick={fetchOverdueOrders} disabled={processing} className="border-[#003f87] text-[#003f87] rounded-sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            className="bg-[#ba1a1a] hover:bg-[#a01515] text-white rounded-sm"
            onClick={handleProcessAll}
            disabled={processing || !overdueData?.count}
          >
            <Undo className="h-4 w-4 mr-2" /> Process & Refund All Overdue
          </Button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-sm text-sm border ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-[#ba1a1a]/10 text-[#ba1a1a] border-[#ba1a1a]/20'}`}>
          {message.text}
        </div>
      )}

      {/* SLA Rules Card */}
      <Card className="bg-white border border-border shadow-sm rounded-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-[#003f87]">SLA Rules Configuration</CardTitle>
          <CardDescription>Rules defining when an order is flagged as overdue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="p-3 border border-border rounded-sm bg-[#f8f9ff]">
              <span className="font-semibold block capitalize text-[#003f87]">Instant Delivery</span>
              <span className="text-muted-foreground text-xs">SLA: 3 hours</span>
            </div>
            <div className="p-3 border border-border rounded-sm bg-[#f8f9ff]">
              <span className="font-semibold block capitalize text-[#003f87]">Next Day Delivery</span>
              <span className="text-muted-foreground text-xs">SLA: 28 hours</span>
            </div>
            <div className="p-3 border border-border rounded-sm bg-[#f8f9ff]">
              <span className="font-semibold block capitalize text-[#003f87]">Regular Delivery</span>
              <span className="text-muted-foreground text-xs">SLA: 72 hours</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overdue Orders */}
      <Card className="bg-white border border-border shadow-sm rounded-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-[#003f87]">
            <AlertTriangle className="h-5 w-5 text-[#ba1a1a] animate-pulse" />
            Overdue Orders ({loading ? '...' : overdueData?.count || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !overdueData?.orders || overdueData.orders.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              No overdue orders currently.
            </div>
          ) : (
            <div className="rounded-sm border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#eff4ff] border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-[#003f87]">Order Number</th>
                      <th className="px-4 py-3 text-left font-medium text-[#003f87]">Buyer</th>
                      <th className="px-4 py-3 text-left font-medium text-[#003f87]">Store</th>
                      <th className="px-4 py-3 text-left font-medium text-[#003f87]">Delivery</th>
                      <th className="px-4 py-3 text-left font-medium text-[#003f87]">Total</th>
                      <th className="px-4 py-3 text-left font-medium text-[#003f87]">Status</th>
                      <th className="px-4 py-3 text-right font-medium text-[#003f87]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {overdueData.orders.map((order) => (
                      <tr key={order.id} className="bg-white hover:bg-[#f8f9ff] transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-foreground">{order.order_number}</td>
                        <td className="px-4 py-3 text-foreground">{order.buyer?.name || '-'}</td>
                        <td className="px-4 py-3 text-foreground">{order.store?.store_name || '-'}</td>
                        <td className="px-4 py-3 capitalize text-foreground">{order.delivery_method}</td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          Rp {Math.round(order.total).toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className={statusColors[order.status] || ''}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            className="bg-[#ba1a1a] hover:bg-[#a01515] text-white rounded-sm"
                            size="sm"
                            onClick={() => handleRefundSingle(order.id)}
                            disabled={processing}
                          >
                            Refund Buyer
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Simulate Dialog */}
      <Dialog open={isSimulateOpen} onOpenChange={setIsSimulateOpen}>
        <DialogContent className="rounded-sm">
          <DialogHeader>
            <DialogTitle className="text-[#003f87]">Simulate Time Forward</DialogTitle>
            <DialogDescription>
              Increase the simulated duration to check and auto-refund orders that would become overdue.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="hours">Hours to simulate</Label>
              <Input
                id="hours"
                type="number"
                min="1"
                max="168"
                value={simulateHours}
                onChange={(e) => setSimulateHours(e.target.value)}
                className="border-border rounded-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSimulateOpen(false)} className="border-border rounded-sm">Cancel</Button>
            <Button onClick={handleSimulate} className="bg-[#003f87] hover:bg-[#002f65] text-white rounded-sm">Simulate & Process</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
