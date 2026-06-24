<?php

namespace App\Http\Controllers\Api\Buyer;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    use ApiResponse;

    /**
     * Get buyer spending report
     */
    public function spendingReport()
    {
        $user = Auth::user();

        // Get all completed orders
        $orders = Order::where('buyer_id', $user->id)
            ->whereIn('status', ['Pesanan Selesai'])
            ->get();

        // Calculate totals
        $totalSpending = $orders->sum('total');
        $totalOrders = $orders->count();
        $totalDiscount = $orders->sum('discount');
        $totalDeliveryFee = $orders->sum('delivery_fee');
        $totalTax = $orders->sum('tax');

        // Get monthly breakdown
        $monthlySpending = Order::where('buyer_id', $user->id)
            ->whereIn('status', ['Pesanan Selesai'])
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as order_count, SUM(total) as total_spent')
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->get();

        // Get wallet transaction summary
        $walletTransactions = WalletTransaction::whereHas('wallet', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->get();

        $totalTopup = $walletTransactions->where('type', 'topup')->sum('amount');
        $totalPayment = abs($walletTransactions->where('type', 'payment')->sum('amount'));
        $currentBalance = $user->wallet ? $user->wallet->balance : 0;

        return $this->success([
            'summary' => [
                'total_spending' => (float) $totalSpending,
                'total_orders' => $totalOrders,
                'total_discount' => (float) $totalDiscount,
                'total_delivery_fee' => (float) $totalDeliveryFee,
                'total_tax' => (float) $totalTax,
            ],
            'monthly_breakdown' => $monthlySpending,
            'wallet_summary' => [
                'current_balance' => (float) $currentBalance,
                'total_topup' => (float) $totalTopup,
                'total_payment' => (float) $totalPayment,
            ],
        ], 'Spending report retrieved successfully.');
    }

    /**
     * Get buyer order history with filters
     */
    public function orderHistory()
    {
        $user = Auth::user();

        $orders = Order::where('buyer_id', $user->id)
            ->with(['items.product', 'store', 'statusHistories'])
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
        ], 'Order history retrieved successfully.');
    }
}
