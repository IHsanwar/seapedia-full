import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../api/orders';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Package, Loader2, Calendar, MapPin, Truck, DollarSign, Eye, ShoppingBag,TruckIcon,CheckCircle,Undo2
} from 'lucide-react';
import { toast } from 'react-toastify';

const STATUS_COLORS = {
  'Sedang Dikemas': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Menunggu Pengirim': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Sedang Dikirim': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'Pesanan Selesai': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Dikembalikan': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const STATUS_ICONS = {
  "Sedang Dikemas": Package,
  "Menunggu Pengirim": Truck,
  "Sedang Dikirim": TruckIcon,
  "Pesanan Selesai": CheckCircle,
  "Dikembalikan": Undo2,
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await orderAPI.getOrders();
      setOrders(res?.data || res);
    } catch (err) {
      toast.error('Gagal memuat riwayat pesanan');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-7 w-7 text-primary" /> Riwayat Pesanan
          </h1>
          <p className="text-muted-foreground">Lihat semua pesanan Anda</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="text-center py-16 border-dashed">
          <CardContent className="space-y-6">
            <div className="bg-primary/10 text-primary w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <Package className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Belum Ada Pesanan</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Anda belum memiliki pesanan. Mulai berbelanja dan buat pesanan pertama Anda!
              </p>
            </div>
            <Button asChild size="lg" className="px-8">
              <Link to="/products">Cari Produk</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Order Header */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold text-lg">{order.order_number}</span>
                      <Badge className={STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'}>
                        {(() => {
                          const Icon = STATUS_ICONS[order.status];
                          return Icon ? <Icon className="mr-1 h-4 w-4" /> : '📋';
                        })()}
                        {order.status}
                      </Badge>
                    </div>

                    {/* Store Info */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="h-4 w-4" />
                      <span>{order.store?.store_name || 'Unknown Store'}</span>
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Truck className="h-4 w-4" />
                        <span className="capitalize">{order.delivery_method.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Package className="h-4 w-4" />
                        <span>{order.items?.length || 0} item</span>
                      </div>
                      <div className="flex items-center gap-2 font-semibold text-primary">
                        <DollarSign className="h-4 w-4" />
                        <span>Rp {parseFloat(order.total).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  {/* View Detail Button */}
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <Link to={`/buyer/orders/${order.id}`}>
                      <Eye className="h-4 w-4" />
                      Lihat Detail
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}