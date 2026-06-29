import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sellerOrderAPI } from '../../api/sellerOrders';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Package, Loader2, Calendar, MapPin, Truck, DollarSign, Eye, ShoppingBag, User, CheckCircle, ArrowLeft
} from 'lucide-react';
import { toast } from 'react-toastify';

const STATUS_COLORS = {
  'Sedang Dikemas': 'bg-[#115cb9]/10 text-[#115cb9]',
  'Menunggu Pengirim': 'bg-[#115cb9]/10 text-[#115cb9]',
  'Sedang Dikirim': 'bg-[#006b5f]/10 text-[#006b5f]',
  'Pesanan Selesai': 'bg-green-100 text-green-700',
  'Dikembalikan': 'bg-[#ba1a1a]/10 text-[#ba1a1a]',
};

const STATUS_ICONS = {
  'Sedang Dikemas': '📦',
  'Menunggu Pengirim': '🚚',
  'Sedang Dikirim': '🚛',
  'Pesanan Selesai': '✅',
  'Dikembalikan': '↩️',
};

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingOrderId, setProcessingOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await sellerOrderAPI.getOrders();
      setOrders(res?.data || res);
    } catch (err) {
      toast.error('Gagal memuat pesanan masuk');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessOrder = async (orderId) => {
    if (!confirm('Apakah Anda yakin ingin memproses pesanan ini?')) return;

    setProcessingOrderId(orderId);
    try {
      await sellerOrderAPI.processOrder({ order_id: orderId });
      toast.success('Pesanan berhasil diproses!');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memproses pesanan');
    } finally {
      setProcessingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#006b5f]" />
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9ff] min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 text-[#006b5f]">
              <ShoppingBag className="h-7 w-7" /> Pesanan Masuk
            </h1>
            <p className="text-muted-foreground">Kelola pesanan dari pembeli</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <Card className="text-center py-16 border-dashed bg-white border border-border rounded-sm">
            <CardContent className="space-y-6">
              <div className="bg-[#006b5f]/10 text-[#006b5f] w-20 h-20 rounded-sm flex items-center justify-center mx-auto">
                <Package className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Belum Ada Pesanan</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Anda belum memiliki pesanan masuk. Pesanan dari pembeli akan muncul di sini.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="bg-white border border-border shadow-sm rounded-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left - Order Info */}
                    <div className="flex-1 space-y-4">
                      {/* Order Header */}
                      <div className="flex items-center gap-3 flex-wrap justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-lg">{order.order_number}</span>
                          <Badge className={STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'}>
                            <span className="mr-1">{STATUS_ICONS[order.status] || '📋'}</span>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('id-ID', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>

                      {/* Buyer Info */}
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{order.buyer?.name || 'Unknown Buyer'}</span>
                      </div>

                      {/* Delivery Address */}
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">{order.address?.recipient_name || 'Unknown'}</p>
                          <p className="text-muted-foreground">{order.address?.full_address || 'Unknown'}</p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Item Pesanan:</p>
                        <div className="space-y-2">
                          {order.items?.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex items-center gap-2 text-sm">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span>{item.product_name} x {item.quantity}</span>
                            </div>
                          ))}
                          {order.items?.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{order.items.length - 3} item lainnya
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right - Actions & Summary */}
                    <div className="lg:w-80 space-y-4">
                      {/* Delivery Method */}
                      <div className="flex items-center gap-2 text-sm">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize">{order.delivery_method.replace('_', ' ')}</span>
                      </div>

                      {/* Total */}
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-[#003f87]" />
                        <span className="text-2xl font-bold text-[#003f87]">
                          Rp {parseFloat(order.total).toLocaleString('id-ID')}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button 
                          asChild 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 gap-2 border-[#003f87] text-[#003f87]"
                        >
                          <Link to={`/seller/orders/${order.id}`}>
                            <Eye className="h-4 w-4" />
                            Detail
                          </Link>
                        </Button>
                        
                        {order.status === 'Sedang Dikemas' && (
                          <Button
                            onClick={() => handleProcessOrder(order.id)}
                            disabled={processingOrderId === order.id}
                            className="flex-1 gap-2 bg-[#006b5f] hover:bg-[#005a50]"
                          >
                            {processingOrderId === order.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Memproses...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                Proses
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
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
