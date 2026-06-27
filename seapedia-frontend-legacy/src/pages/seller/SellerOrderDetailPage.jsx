import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { sellerOrderAPI } from '../../api/sellerOrders';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Package, Loader2, Calendar, MapPin, Truck, DollarSign, ArrowLeft, Phone, User, Clock, CheckCircle
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
  'Sedang Dikemas': '📦',
  'Menunggu Pengirim': '🚚',
  'Sedang Dikirim': '🚛',
  'Pesanan Selesai': '✅',
  'Dikembalikan': '↩️',
};

export default function SellerOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await sellerOrderAPI.getOrder(id);
      setOrder(res?.data || res);
    } catch (err) {
      toast.error('Gagal memuat detail pesanan');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessOrder = async () => {
    if (!confirm('Apakah Anda yakin ingin memproses pesanan ini?')) return;

    setProcessing(true);
    try {
      await sellerOrderAPI.processOrder({ order_id: id });
      toast.success('Pesanan berhasil diproses!');
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memproses pesanan');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Card className="text-center py-16">
          <CardContent>
            <p className="text-muted-foreground">Pesanan tidak ditemukan</p>
            <Button asChild className="mt-4">
              <Link to="/seller/orders">Kembali ke Pesanan</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link to="/seller/orders" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-1" /> Kembali ke Pesanan
      </Link>

      <div className="space-y-6">
        {/* Order Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {order.order_number}
                </CardTitle>
                <CardDescription>
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(order.created_at).toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </CardDescription>
              </div>
              <Badge className={`${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'} px-4 py-2 text-base`}>
                <span className="mr-2">{STATUS_ICONS[order.status] || '📋'}</span>
                {order.status}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Buyer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" /> Informasi Pembeli
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-semibold text-lg">{order.buyer?.name || 'Unknown Buyer'}</p>
                  {order.buyer?.email && (
                    <p className="text-sm text-muted-foreground">{order.buyer.email}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" /> Alamat Pengiriman
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{order.address?.recipient_name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{order.address?.recipient_phone || 'Unknown'}</span>
                  </div>
                  <p className="text-sm">{order.address?.address || 'Unknown'}</p>
                  {order.address?.city && (
                    <p className="text-sm text-muted-foreground">{order.address.city}, {
                      order.address?.province ? `${order.address.province} ` : ''
                    }{order.address?.postal_code || ''}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" /> Item Pesanan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                        {item.product?.thumbnail_image || item.product?.image_url ? (
                          <img
                            src={item.product.image_url || item.product.thumbnail_image}
                            alt={item.product_name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className="text-[8px] text-muted-foreground flex items-center justify-center h-full">No Image</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x Rp {parseFloat(item.price).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <p className="font-bold">Rp {parseFloat(item.subtotal).toLocaleString('id-ID')}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" /> Ringkasan Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm border-b pb-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-medium text-foreground">Rp {parseFloat(order.subtotal).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Biaya Pengiriman</span>
                    <span className="font-medium text-foreground">Rp {parseFloat(order.delivery_fee).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Diskon</span>
                    <span className="font-medium text-foreground">Rp {parseFloat(order.discount).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>PPN (12%)</span>
                    <span className="font-medium text-foreground">Rp {parseFloat(order.tax).toLocaleString('id-ID')}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-semibold text-lg">Total Bayar</span>
                  <span className="text-2xl font-bold text-primary">
                    Rp {parseFloat(order.total).toLocaleString('id-ID')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" /> Riwayat Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.status_histories?.map((history, index) => (
                    <div key={history.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index === order.status_histories.length - 1 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {index === order.status_histories.length - 1 ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-current" />
                          )}
                        </div>
                        {index < order.status_histories.length - 1 && (
                          <div className="w-0.5 h-8 bg-border mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium">{history.status}</p>
                        <p className="text-sm text-muted-foreground">{history.note || ''}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(history.created_at).toLocaleDateString('id-ID', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Process Order Button */}
            {order.status === 'Sedang Dikemas' && (
              <Card>
                <CardContent className="pt-6">
                  <Button
                    onClick={handleProcessOrder}
                    disabled={processing}
                    className="w-full py-6 text-md font-semibold gap-2 shadow-lg hover:shadow-xl transition-all"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Proses Pesanan
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Pesanan akan berpindah ke status "Menunggu Pengirim"
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}