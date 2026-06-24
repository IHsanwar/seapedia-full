<?php

namespace App\Http\Controllers\Api\Seller;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    use ApiResponse;

    /**
     * Get seller income report
     */
    public function incomeReport()
    {
        $store = Auth::user()->store;

        if (!$store) {
            return $this->error('Store not found.', null, 404);
        }

        // Get all completed orders for this store
        $completedOrders = Order::where('store_id', $store->id)
            ->whereIn('status', ['Pesanan Selesai'])
            ->get();

        // Calculate totals
        $totalIncome = $completedOrders->sum('subtotal'); // Seller gets subtotal (before fees)
        $totalOrders = $completedOrders->count();
        $totalDiscount = $completedOrders->sum('discount');

        // Get monthly breakdown
        $monthlyIncome = Order::where('store_id', $store->id)
            ->whereIn('status', ['Pesanan Selesai'])
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as order_count, SUM(subtotal) as total_income')
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->get();

        // Get product sales breakdown
        $productSales = OrderItem::whereHas('order', function ($query) use ($store) {
            $query->where('store_id', $store->id)
                ->whereIn('status', ['Pesanan Selesai']);
        })
            ->selectRaw('product_id, product_name, SUM(quantity) as total_sold, SUM(subtotal) as total_revenue')
            ->groupBy('product_id', 'product_name')
            ->orderBy('total_revenue', 'desc')
            ->get();

        // Get pending orders summary
        $pendingOrders = Order::where('store_id', $store->id)
            ->whereIn('status', ['Sedang Dikemas', 'Menunggu Pengirim', 'Sedang Dikirim'])
            ->get();

        return $this->success([
            'summary' => [
                'total_income' => (float) $totalIncome,
                'total_orders' => $totalOrders,
                'total_discount_given' => (float) $totalDiscount,
                'average_order_value' => $totalOrders > 0 ? (float) ($totalIncome / $totalOrders) : 0,
            ],
            'monthly_breakdown' => $monthlyIncome,
            'product_sales' => $productSales,
            'pending_orders_summary' => [
                'total_pending' => $pendingOrders->count(),
                'by_status' => [
                    'Sedang Dikemas' => $pendingOrders->where('status', 'Sedang Dikemas')->count(),
                    'Menunggu Pengirim' => $pendingOrders->where('status', 'Menunggu Pengirim')->count(),
                    'Sedang Dikirim' => $pendingOrders->where('status', 'Sedang Dikirim')->count(),
                ],
            ],
        ], 'Income report retrieved successfully.');
    }

    /**
     * Get seller order list with filters
     */
    public function orderList()
    {
        $store = Auth::user()->store;

        if (!$store) {
            return $this->error('Store not found.', null, 404);
        }

        $orders = Order::where('store_id', $store->id)
            ->with(['items.product', 'buyer', 'statusHistories'])
            ->latest()
            ->paginate(10);

        return $this->success([
            'orders' => OrderResource::collection($orders),
            'pagination' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ], 'Order list retrieved successfully.');
    }

    /**
     * Get processed orders report
     */
    public function processedOrders()
    {
        $store = Auth::user()->store;

        if (!$store) {
            return $this->error('Store not found.', null, 404);
        }

        $processedOrders = Order::where('store_id', $store->id)
            ->whereIn('status', ['Menunggu Pengirim', 'Sedang Dikirim', 'Pesanan Selesai'])
            ->with(['items.product', 'buyer', 'statusHistories'])
            ->latest()
            ->get();

        return $this->success([
            'processed_orders' => OrderResource::collection($processedOrders),
            'summary' => [
                'total_processed' => $processedOrders->count(),
                'by_status' => [
                    'Menunggu Pengirim' => $processedOrders->where('status', 'Menunggu Pengirim')->count(),
                    'Sedang Dikirim' => $processedOrders->where('status', 'Sedang Dikirim')->count(),
                    'Pesanan Selesai' => $processedOrders->where('status', 'Pesanan Selesai')->count(),
                ],
            ],
        ], 'Processed orders retrieved successfully.');
    }
}
