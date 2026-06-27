<?php

namespace App\Http\Controllers\Api\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;

/**
 * @group Admin Dashboard
 *
 * APIs for admin dashboard statistics and marketplace overview.
 *
 * @authenticated
 */
class DashboardController extends Controller
{
    use ApiResponse;

    /**
     * Dashboard summary.
     *
     * Get overall marketplace statistics including users, stores, orders, products, and revenue.
     */
    public function index()
    {
        $totalUsers = User::count();
        $totalStores = Store::count();
        $totalProducts = Product::count();
        $totalOrders = Order::count();
        $totalRevenue = Order::where('status', 'Pesanan Selesai')->sum('total');

        // Orders by status
        $ordersByStatus = Order::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        // Recent orders (last 7 days)
        $recentOrders = Order::where('created_at', '>=', now()->subDays(7))->count();

        // Active deliveries
        $activeDeliveries = Delivery::whereIn('status', ['pending', 'in_progress'])->count();
        $completedDeliveries = Delivery::where('status', 'completed')->count();

        // Overdue orders count
        $overdueCount = $this->getOverdueCount();

        return $this->success([
            'total_users' => $totalUsers,
            'total_stores' => $totalStores,
            'total_products' => $totalProducts,
            'total_orders' => $totalOrders,
            'total_revenue' => (float) $totalRevenue,
            'orders_by_status' => $ordersByStatus,
            'recent_orders_7d' => $recentOrders,
            'active_deliveries' => $activeDeliveries,
            'completed_deliveries' => $completedDeliveries,
            'overdue_orders' => $overdueCount,
        ], 'Dashboard statistics retrieved successfully.');
    }

    /**
     * User statistics.
     *
     * Get user statistics grouped by role.
     */
    public function userStats()
    {
        $totalUsers = User::count();

        $usersByRole = User::selectRaw('roles.name as role, COUNT(users.id) as count')
            ->join('role_user', 'users.id', '=', 'role_user.user_id')
            ->join('roles', 'roles.id', '=', 'role_user.role_id')
            ->groupBy('roles.name')
            ->pluck('count', 'role');

        $recentUsers = User::where('created_at', '>=', now()->subDays(30))->count();

        return $this->success([
            'total' => $totalUsers,
            'by_role' => $usersByRole,
            'new_last_30_days' => $recentUsers,
        ], 'User statistics retrieved successfully.');
    }

    /**
     * Order statistics.
     *
     * Get order statistics grouped by status.
     */
    public function orderStats()
    {
        $total = Order::count();

        $byStatus = Order::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $totalRevenue = Order::where('status', 'Pesanan Selesai')->sum('total');
        $avgOrderValue = Order::where('status', 'Pesanan Selesai')->avg('total');

        return $this->success([
            'total' => $total,
            'by_status' => $byStatus,
            'total_revenue' => (float) $totalRevenue,
            'average_order_value' => (float) ($avgOrderValue ?? 0),
        ], 'Order statistics retrieved successfully.');
    }

    /**
     * Delivery statistics.
     *
     * Get delivery statistics grouped by status and method.
     */
    public function deliveryStats()
    {
        $total = Delivery::count();

        $byStatus = Delivery::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $byMethod = Delivery::selectRaw('method, COUNT(*) as count')
            ->groupBy('method')
            ->pluck('count', 'method');

        return $this->success([
            'total' => $total,
            'by_status' => $byStatus,
            'by_method' => $byMethod,
        ], 'Delivery statistics retrieved successfully.');
    }

    /**
     * Calculate overdue orders count.
     */
    private function getOverdueCount(): int
    {
        $slaHours = [
            'instant' => 3,
            'next_day' => 28,
            'regular' => 72,
        ];

        $count = 0;

        foreach ($slaHours as $method => $hours) {
            $count += Order::whereIn('status', ['Sedang Dikirim', 'Menunggu Pengirim'])
                ->where('delivery_method', $method)
                ->whereHas('delivery', function ($q) use ($hours) {
                    $q->where('created_at', '<=', now()->subHours($hours));
                })
                ->count();
        }

        return $count;
    }
}
