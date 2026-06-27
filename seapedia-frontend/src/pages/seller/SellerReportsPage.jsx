import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sellerReportsAPI } from '../../api/sellerReports';
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
  DollarSign, 
  Calendar,
  ArrowRight,
  Package,
  Receipt,
  BarChart3
} from 'lucide-react';
import { toast } from 'react-toastify';

const STATUS_COLORS = {
  'Sedang Dikemas': 'bg-blue-100 text-blue-800',
  'Menunggu Pengirim': 'bg-yellow-100 text-yellow-800',
  'Sedang Dikirim': 'bg-purple-100 text-purple-800',
  'Pesanan Selesai': 'bg-green-100 text-green-800',
  'Dikembalikan': 'bg-red-100 text-red-800',
};

export default function SellerReportsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    fetchIncomeReport();
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchIncomeReport = async () => {
    setLoading(true);
    try {
      const response = await sellerReportsAPI.getIncomeReport();
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching income report:', error);
      toast.error('Gagal memuat laporan pendapatan');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await sellerReportsAPI.getOrderList();
      setOrders(response.data?.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Gagal memuat daftar pesanan');
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
  const monthlyBreakdown = reportData?.monthly_breakdown || [];
  const productSales = reportData?.product_sales || [];
  const pendingSummary = reportData?.pending_orders_summary || {};

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Laporan Penjualan</h1>
        <p className="text-muted-foreground mt-1">
          Pantau pendapatan dan kinerja toko Anda
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
            Pesanan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Pendapatan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">
                    Rp {parseFloat(summary.total_income || 0).toLocaleString('id-ID')}
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
                  Rata-rata Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">
                    Rp {parseFloat(summary.average_order_value || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pesanan Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-orange-500" />
                  <span className="text-2xl font-bold text-orange-500">
                    {pendingSummary.total_pending || 0}
                  </span>
                  <span className="text-muted-foreground">pesanan</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Sales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Penjualan Produk
              </CardTitle>
            </CardHeader>
            <CardContent>
              {productSales.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Belum ada data penjualan produk
                </p>
              ) : (
                <div className="space-y-3">
                  {productSales.map((product) => (
                    <div
                      key={product.product_id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{product.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.total_sold} terjual
                        </p>
                      </div>
                      <p className="font-bold text-lg">
                        Rp {parseFloat(product.total_revenue).toLocaleString('id-ID')}
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
              <CardTitle>Daftar Pesanan</CardTitle>
              <CardDescription>
                Semua pesanan yang masuk ke toko Anda
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
                            Pembeli: {order.buyer?.name || 'Unknown'}
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
                            <Link to={`/seller/orders/${order.id}`}>
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
