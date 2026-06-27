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
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
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
      <div className="container mx-auto p-6">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          {error}
          <Button variant="outline" className="ml-4" onClick={fetchDashboard}>
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
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      link: '/admin/users',
    },
    {
      title: 'Total Stores',
      value: dashboard.total_stores,
      icon: Store,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      link: '/admin/stores',
    },
    {
      title: 'Total Products',
      value: dashboard.total_products,
      icon: Package,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      link: null,
    },
    {
      title: 'Total Orders',
      value: dashboard.total_orders,
      icon: ShoppingBag,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      link: '/admin/orders',
    },
    {
      title: 'Revenue',
      value: `Rp ${Math.round(dashboard.total_revenue).toLocaleString('id-ID')}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
      link: null,
    },
    {
      title: 'Orders (7 days)',
      value: dashboard.recent_orders_7d,
      icon: BarChart3,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
      link: '/admin/orders',
    },
    {
      title: 'Active Deliveries',
      value: dashboard.active_deliveries,
      icon: Truck,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      link: '/admin/deliveries',
    },
    {
      title: 'Overdue Orders',
      value: dashboard.overdue_orders,
      icon: AlertTriangle,
      color: dashboard.overdue_orders > 0 ? 'text-red-600' : 'text-gray-500',
      bg: dashboard.overdue_orders > 0 ? 'bg-red-50' : 'bg-gray-50',
      link: '/admin/overdue',
    },
  ];

  const statusColors = {
    'Menunggu Pembayaran': 'bg-yellow-100 text-yellow-800',
    'Sedang Dikemas': 'bg-blue-100 text-blue-800',
    'Menunggu Pengirim': 'bg-orange-100 text-orange-800',
    'Sedang Dikirim': 'bg-indigo-100 text-indigo-800',
    'Pesanan Selesai': 'bg-green-100 text-green-800',
    'Dikembalikan': 'bg-red-100 text-red-800',
    'Dibatalkan': 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitoring overview for SEApedia Marketplace</p>
        </div>
        <Button variant="outline" onClick={fetchDashboard}>
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="relative overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                {card.link && (
                  <Link
                    to={card.link}
                    className="text-xs text-muted-foreground hover:text-primary mt-1 inline-flex items-center gap-1"
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Orders by Status</CardTitle>
        </CardHeader>
        <CardContent>
          {dashboard.orders_by_status && Object.keys(dashboard.orders_by_status).length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {Object.entries(dashboard.orders_by_status).map(([status, count]) => (
                <div
                  key={status}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border"
                >
                  <Badge variant="secondary" className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
                    {status}
                  </Badge>
                  <span className="font-semibold text-lg">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No orders yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link to="/admin/orders">
              <Button variant="outline" className="w-full justify-start gap-2">
                <ShoppingBag className="h-4 w-4" /> Monitor Orders
              </Button>
            </Link>
            <Link to="/admin/stores">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Store className="h-4 w-4" /> Monitor Stores
              </Button>
            </Link>
            <Link to="/admin/deliveries">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Truck className="h-4 w-4" /> Monitor Deliveries
              </Button>
            </Link>
            <Link to="/admin/overdue">
              <Button variant="outline" className="w-full justify-start gap-2">
                <AlertTriangle className="h-4 w-4" /> Overdue Orders
              </Button>
            </Link>
            <Link to="/admin/vouchers">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Eye className="h-4 w-4" /> Manage Vouchers
              </Button>
            </Link>
            <Link to="/admin/promos">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Eye className="h-4 w-4" /> Manage Promos
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
