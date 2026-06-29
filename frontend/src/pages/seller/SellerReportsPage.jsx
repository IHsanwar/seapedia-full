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
  'Sedang Dikemas': 'bg-[#115cb9]/10 text-[#115cb9]',
  'Menunggu Pengirim': 'bg-[#115cb9]/10 text-[#115cb9]',
  'Sedang Dikirim': 'bg-[#006b5f]/10 text-[#006b5f]',
  'Pesanan Selesai': 'bg-green-100 text-green-700',
  'Dikembalikan': 'bg-[#ba1a1a]/10 text-[#ba1a1a]',
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
      <div className="bg-[#f8f9ff] min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#006b5f]" />
          </div>
        </div>
      </div>
    );
  }

  const summary = reportData?.summary || {};
  const monthlyBreakdown = reportData?.monthly_breakdown || [];
  const productSales = reportData?.product_sales || [];
  const pendingSummary = reportData?.pending_orders_summary || {};

  return (
    <div className="bg-[#f8f9ff] min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#006b5f]">Laporan Penjualan</h1>
          <p className="text-muted-foreground mt-1">
            Pantau pendapatan dan kinerja toko Anda
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-white border border-border rounded-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#006b5f] data-[state=active]:text-white rounded-sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              Ringkasan
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-[#006b5f] data-[state=active]:text-white rounded-sm">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Pesanan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white border border-border shadow-sm rounded-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Pendapatan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-[#006b5f]" />
                    <span className="text-2xl font-bold text-[#003f87]">
                      Rp {parseFloat(summary.total_income || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-border shadow-sm rounded-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Pesanan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-[#006b5f]" />
                    <span className="text-2xl font-bold">
                      {summary.total_orders || 0}
                    </span>
                    <span className="text-muted-foreground">pesanan</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-border shadow-sm rounded-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Rata-rata Order
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-[#006b5f]" />
                    <span className="text-2xl font-bold text-[#003f87]">
                      Rp {parseFloat(summary.average_order_value || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-border shadow-sm rounded-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pesanan Pending
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-[#115cb9]" />
                    <span className="text-2xl font-bold text-[#115cb9]">
                      {pendingSummary.total_pending || 0}
                    </span>
                    <span className="text-muted-foreground">pesanan</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Product Sales */}
            <Card className="bg-white border border-border shadow-sm rounded-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#006b5f]">
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
                        className="flex items-center justify-between p-3 bg-[#f8f9ff] border border-border rounded-sm"
                      >
                        <div>
                          <p className="font-medium">{product.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.total_sold} terjual
                          </p>
                        </div>
                        <p className="font-bold text-lg text-[#003f87]">
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
            <Card className="bg-white border border-border shadow-sm rounded-sm">
              <CardHeader>
                <CardTitle className="text-[#006b5f]">Daftar Pesanan</CardTitle>
                <CardDescription>
                  Semua pesanan yang masuk ke toko Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[#006b5f]" />
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
                        className="border border-border rounded-sm p-4 bg-[#f8f9ff] hover:bg-white transition-colors"
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
                            <p className="font-bold text-lg text-[#003f87]">
                              Rp {parseFloat(order.total).toLocaleString('id-ID')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.items?.length || 0} item
                            </p>
                            <Button asChild variant="outline" size="sm" className="mt-2 border-[#003f87] text-[#003f87]">
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
    </div>
  );
}
