import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import {
  Users, ShoppingBag, Store, Package,
  Truck, AlertTriangle, TrendingUp, BarChart3,
  Eye, ArrowRight
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboard();
      setDashboard(response.data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] p-6 space-y-6">
        <h1 className="text-3xl font-bold text-[#003f87]">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="bg-white border border-border shadow-sm rounded-sm">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] p-6">
        <div className="bg-[#ba1a1a]/10 text-[#ba1a1a] p-4 rounded-sm border border-[#ba1a1a]/20">
          {error}
          <Button variant="outline" className="ml-4 border-[#003f87] text-[#003f87]" onClick={fetchDashboard}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: dashboard.total_users,
      icon: Users,
      color: 'text-[#003f87]',
      bg: 'bg-[#003f87]/10',
      link: '/admin/users',
    },
    {
      title: 'Total Stores',
      value: dashboard.total_stores,
      icon: Store,
      color: 'text-[#006b5f]',
      bg: 'bg-[#006b5f]/10',
      link: '/admin/stores',
    },
    {
      title: 'Total Products',
      value: dashboard.total_products,
      icon: Package,
      color: 'text-[#115cb9]',
      bg: 'bg-[#115cb9]/10',
      link: null,
    },
    {
      title: 'Total Orders',
      value: dashboard.total_orders,
      icon: ShoppingBag,
      color: 'text-[#722b00]',
      bg: 'bg-[#722b00]/10',
      link: '/admin/orders',
    },
    {
      title: 'Revenue',
      value: `Rp ${Math.round(dashboard.total_revenue).toLocaleString('id-ID')}`,
      icon: TrendingUp,
      color: 'text-[#006b5f]',
      bg: 'bg-[#006b5f]/10',
      link: null,
    },
    {
      title: 'Orders (7 days)',
      value: dashboard.recent_orders_7d,
      icon: BarChart3,
      color: 'text-[#115cb9]',
      bg: 'bg-[#115cb9]/10',
      link: '/admin/orders',
    },
    {
      title: 'Active Deliveries',
      value: dashboard.active_deliveries,
      icon: Truck,
      color: 'text-[#003f87]',
      bg: 'bg-[#003f87]/10',
      link: '/admin/deliveries',
    },
    {
      title: 'Overdue Orders',
      value: dashboard.overdue_orders,
      icon: AlertTriangle,
      color: dashboard.overdue_orders > 0 ? 'text-[#ba1a1a]' : 'text-muted-foreground',
      bg: dashboard.overdue_orders > 0 ? 'bg-[#ba1a1a]/10' : 'bg-muted',
      link: '/admin/overdue',
    },
  ];

  const statusColors = {
    'Menunggu Pembayaran': 'bg-[#115cb9]/10 text-[#115cb9]',
    'Sedang Dikemas': 'bg-[#115cb9]/10 text-[#115cb9]',
    'Menunggu Pengirim': 'bg-[#722b00]/10 text-[#722b00]',
    'Sedang Dikirim': 'bg-[#006b5f]/10 text-[#006b5f]',
    'Pesanan Selesai': 'bg-green-100 text-green-700',
    'Dikembalikan': 'bg-[#ba1a1a]/10 text-[#ba1a1a]',
    'Dibatalkan': 'bg-muted text-muted-foreground',
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#003f87] tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitoring overview for SEApedia Marketplace</p>
        </div>
        <Button variant="outline" className="border-[#003f87] text-[#003f87]" onClick={fetchDashboard}>
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="bg-white border border-border shadow-sm rounded-sm relative overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-sm ${card.bg}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{card.value}</div>
                {card.link && (
                  <Link
                    to={card.link}
                    className="text-xs text-[#003f87] hover:text-[#002f65] mt-1 inline-flex items-center gap-1"
                  >
                    View details <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Order Status Breakdown */}
      <Card className="bg-white border border-border shadow-sm rounded-sm">
        <CardHeader>
          <CardTitle className="text-lg text-[#003f87]">Orders by Status</CardTitle>
        </CardHeader>
        <CardContent>
          {dashboard.orders_by_status && Object.keys(dashboard.orders_by_status).length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {Object.entries(dashboard.orders_by_status).map(([status, count]) => (
                <div
                  key={status}
                  className="flex items-center gap-2 px-4 py-2 rounded-sm border border-border bg-white"
                >
                  <Badge variant="secondary" className={statusColors[status] || 'bg-muted text-muted-foreground'}>
                    {status}
                  </Badge>
                  <span className="font-semibold text-lg text-foreground">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No orders yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-white border border-border shadow-sm rounded-sm">
        <CardHeader>
          <CardTitle className="text-lg text-[#003f87]">Quick Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link to="/admin/orders">
              <Button variant="outline" className="w-full justify-start gap-2 border-[#003f87] text-[#003f87] hover:bg-[#003f87]/10 rounded-sm">
                <ShoppingBag className="h-4 w-4" /> Monitor Orders
              </Button>
            </Link>
            <Link to="/admin/stores">
              <Button variant="outline" className="w-full justify-start gap-2 border-[#003f87] text-[#003f87] hover:bg-[#003f87]/10 rounded-sm">
                <Store className="h-4 w-4" /> Monitor Stores
              </Button>
            </Link>
            <Link to="/admin/deliveries">
              <Button variant="outline" className="w-full justify-start gap-2 border-[#003f87] text-[#003f87] hover:bg-[#003f87]/10 rounded-sm">
                <Truck className="h-4 w-4" /> Monitor Deliveries
              </Button>
            </Link>
            <Link to="/admin/overdue">
              <Button variant="outline" className="w-full justify-start gap-2 border-[#003f87] text-[#003f87] hover:bg-[#003f87]/10 rounded-sm">
                <AlertTriangle className="h-4 w-4" /> Overdue Orders
              </Button>
            </Link>
            <Link to="/admin/vouchers">
              <Button variant="outline" className="w-full justify-start gap-2 border-[#003f87] text-[#003f87] hover:bg-[#003f87]/10 rounded-sm">
                <Eye className="h-4 w-4" /> Manage Vouchers
              </Button>
            </Link>
            <Link to="/admin/promos">
              <Button variant="outline" className="w-full justify-start gap-2 border-[#003f87] text-[#003f87] hover:bg-[#003f87]/10 rounded-sm">
                <Eye className="h-4 w-4" /> Manage Promos
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
