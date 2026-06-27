import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { buyerReportsAPI } from '../../api/buyerReports';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Loader2, 
  TrendingUp, 
  ShoppingBag, 
  Wallet, 
  Calendar,
  ArrowRight,
  Package,
  DollarSign,
  Receipt
} from 'lucide-react';
import { toast } from 'react-toastify';

const STATUS_COLORS = {
  'Sedang Dikemas': 'bg-blue-100 text-blue-800',
  'Menunggu Pengirim': 'bg-yellow-100 text-yellow-800',
  'Sedang Dikirim': 'bg-purple-100 text-purple-800',
  'Pesanan Selesai': 'bg-green-100 text-green-800',
  'Dikembalikan': 'bg-red-100 text-red-800',
};

export default function BuyerReportsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  });

  useEffect(() => {
    fetchSpendingReport();
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, pagination.currentPage]);

  const fetchSpendingReport = async () => {
    setLoading(true);
    try {
      const response = await buyerReportsAPI.getSpendingReport();
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching spending report:', error);
      toast.error('Gagal memuat laporan pengeluaran');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await buyerReportsAPI.getOrderHistory({
        page: pagination.currentPage,
      });
      setOrders(response.data?.orders || []);
      setPagination(response.data?.pagination || pagination);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Gagal memuat riwayat pesanan');
    } finally {
      setOrdersLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const summary = reportData?.summary || {};
  const walletSummary = reportData?.wallet_summary || {};
  const monthlyBreakdown = reportData?.monthly_breakdown || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Laporan Pembelian</h1>
        <p className="text-muted-foreground mt-1">
          Pantau pengeluaran dan riwayat pembelian Anda
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">
            <TrendingUp className="h-4 w-4 mr-2" />
            Ringkasan
          </TabsTrigger>
          <TabsTrigger value="orders">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Riwayat Pesanan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Pengeluaran
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">
                    Rp {parseFloat(summary.total_spending || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Pesanan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">
                    {summary.total_orders || 0}
                  </span>
                  <span className="text-muted-foreground">pesanan</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Diskon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">
                    Rp {parseFloat(summary.total_discount || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Saldo Wallet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">
                    Rp {parseFloat(walletSummary.current_balance || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Ringkasan Bulanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyBreakdown.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Belum ada data pembelian
                </p>
              ) : (
                <div className="space-y-3">
                  {monthlyBreakdown.map((month) => (
                    <div
                      key={month.month}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {new Date(month.month + '-01').toLocaleDateString('id-ID', {
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {month.order_count} pesanan
                        </p>
                      </div>
                      <p className="font-bold text-lg">
                        Rp {parseFloat(month.total_spent).toLocaleString('id-ID')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Pesanan</CardTitle>
              <CardDescription>
                Daftar semua pesanan yang pernah Anda lakukan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Belum ada pesanan</p>
                  <Button asChild className="mt-4">
                    <Link to="/products">Mulai Belanja</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{order.order_number}</p>
                            <Badge className={STATUS_COLORS[order.status]}>
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(order.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.store?.store_name || 'Unknown Store'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            Rp {parseFloat(order.total).toLocaleString('id-ID')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.items?.length || 0} item
                          </p>
                          <Button asChild variant="outline" size="sm" className="mt-2">
                            <Link to={`/orders/${order.id}`}>
                              Detail <ArrowRight className="h-3 w-3 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
