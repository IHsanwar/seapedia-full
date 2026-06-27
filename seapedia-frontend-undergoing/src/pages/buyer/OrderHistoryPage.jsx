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
  'pending': 'bg-[#115cb9]/10 text-[#115cb9]',
  'processing': 'bg-[#006b5f]/10 text-[#006b5f]',
  'completed': 'bg-green-100 text-green-700',
  'cancelled': 'bg-[#ba1a1a]/10 text-[#ba1a1a]',
  'Sedang Dikemas': 'bg-[#115cb9]/10 text-[#115cb9]',
  'Menunggu Pengirim': 'bg-[#115cb9]/10 text-[#115cb9]',
  'Sedang Dikirim': 'bg-[#006b5f]/10 text-[#006b5f]',
  'Pesanan Selesai': 'bg-green-100 text-green-700',
  'Dikembalikan': 'bg-[#ba1a1a]/10 text-[#ba1a1a]',
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
  const [activeFilter, setActiveFilter] = useState('all');

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

  const filteredOrders = orders.filter(order => {
    if (activeFilter === 'all') return true;
    return order.status?.toLowerCase().includes(activeFilter);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#006b5f]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff]">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 text-[#003f87]">
              <ShoppingBag className="h-7 w-7 text-[#006b5f]" /> Riwayat Pesanan
            </h1>
            <p className="text-gray-600">Lihat semua pesanan Anda</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'Semua' },
            { key: 'pending', label: 'Pending' },
            { key: 'processing', label: 'Diproses' },
            { key: 'completed', label: 'Selesai' },
            { key: 'cancelled', label: 'Dibatalkan' },
          ].map((filter) => (
            <Button
              key={filter.key}
              variant={activeFilter === filter.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(filter.key)}
              className={activeFilter === filter.key ? 'bg-[#003f87] text-white' : 'border-border text-gray-600'}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <Card className="text-center py-16 border-dashed bg-white border border-border shadow-sm">
            <CardContent className="space-y-6">
              <div className="bg-[#006b5f]/10 text-[#006b5f] w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <Package className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-[#003f87]">Belum Ada Pesanan</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Anda belum memiliki pesanan. Mulai berbelanja dan buat pesanan pertama Anda!
                </p>
              </div>
              <Button asChild size="lg" className="px-8 bg-[#006b5f] hover:bg-[#005a50]">
                <Link to="/products">Cari Produk</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow bg-white border border-border shadow-sm rounded-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Order Header */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-semibold text-lg text-[#003f87]">{order.order_number}</span>
                        <Badge className={STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'}>
                          {(() => {
                            const Icon = STATUS_ICONS[order.status];
                            return Icon ? <Icon className="mr-1 h-4 w-4" /> : '📋';
                          })()}
                          {order.status}
                        </Badge>
                      </div>

                      {/* Store Info */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Package className="h-4 w-4" />
                        <span>{order.store?.store_name || 'Unknown Store'}</span>
                      </div>

                      {/* Order Details */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Truck className="h-4 w-4" />
                          <span className="capitalize">{order.delivery_method.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Package className="h-4 w-4" />
                          <span>{order.items?.length || 0} item</span>
                        </div>
                        <div className="flex items-center gap-2 font-semibold text-[#003f87]">
                          <DollarSign className="h-4 w-4" />
                          <span>Rp {parseFloat(order.total).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>

                    {/* View Detail Button */}
                    <Button asChild variant="outline" size="sm" className="gap-2 border-[#003f87] text-[#003f87]">
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
    </div>
  );
}
