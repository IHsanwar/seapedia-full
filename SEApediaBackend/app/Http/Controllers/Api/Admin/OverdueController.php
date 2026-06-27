<?php

namespace App\Http\Controllers\Api\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Delivery;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * @group Admin Overdue Handling
 *
 * APIs for managing overdue orders: detection, refund, and time simulation.
 *
 * @authenticated
 */
class OverdueController extends Controller
{
    use ApiResponse;

    /**
     * SLA definitions in hours per delivery method.
     */
    private const SLA_HOURS = [
        'instant'  => 3,
        'next_day' => 28,
        'regular'  => 72,
    ];

    /**
     * List overdue orders.
     *
     * Get all orders that have exceeded their SLA.
     */
    public function index(Request $request)
    {
        $overdueOrders = $this->getOverdueOrders();

        return $this->success([
            'count' => $overdueOrders->count(),
            'orders' => OrderResource::collection($overdueOrders),
            'sla_rules' => self::SLA_HOURS,
        ], 'Overdue orders retrieved successfully.');
    }

    /**
     * Process all overdue orders.
     *
     * Automatically refund all overdue orders: update status, refund wallet, restore stock.
     */
    public function processAll()
    {
        $overdueOrders = $this->getOverdueOrders();

        if ($overdueOrders->isEmpty()) {
            return $this->success([
                'processed' => 0,
                'details' => [],
            ], 'No overdue orders to process.');
        }

        $processed = [];
        $errors = [];

        foreach ($overdueOrders as $order) {
            try {
                $result = $this->refundOrder($order);
                $processed[] = $result;
            } catch (\Exception $e) {
                $errors[] = [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return $this->success([
            'processed' => count($processed),
            'errors' => count($errors),
            'details' => $processed,
            'error_details' => $errors,
        ], count($processed) . ' overdue orders processed successfully.');
    }

    /**
     * Refund a single overdue order.
     *
     * Manually refund a specific overdue order.
     */
    public function refundSingle(Order $order)
    {
        // Double-refund protection
        if ($order->status === 'Dikembalikan') {
            return $this->error('Order has already been refunded.', null, 400);
        }

        // Check if order is eligible for overdue refund
        if (!in_array($order->status, ['Sedang Dikirim', 'Menunggu Pengirim'])) {
            return $this->error(
                'Order is not eligible for overdue refund. Current status: ' . $order->status,
                null,
                400
            );
        }

        try {
            $result = $this->refundOrder($order);

            return $this->success($result, 'Order refunded successfully.');
        } catch (\Exception $e) {
            return $this->error('Failed to refund order: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Simulate next day.
     *
     * Advance simulated time for demo/testing purposes.
     * This processes orders that would be overdue after the simulated time passes.
     */
    public function simulateNextDay(Request $request)
    {
        $request->validate([
            'hours' => 'nullable|integer|min:1|max:168',
        ]);

        $hours = $request->input('hours', 24);

        // Find orders that would become overdue with the simulated time shift
        $wouldBeOverdue = $this->getOverdueOrders($hours);

        if ($wouldBeOverdue->isEmpty()) {
            return $this->success([
                'simulated_hours' => $hours,
                'processed' => 0,
                'details' => [],
            ], "Simulated {$hours} hours forward. No orders became overdue.");
        }

        $processed = [];
        $errors = [];

        foreach ($wouldBeOverdue as $order) {
            try {
                $result = $this->refundOrder($order);
                $processed[] = $result;
            } catch (\Exception $e) {
                $errors[] = [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return $this->success([
            'simulated_hours' => $hours,
            'processed' => count($processed),
            'errors' => count($errors),
            'details' => $processed,
            'error_details' => $errors,
        ], "Simulated {$hours} hours forward. " . count($processed) . ' overdue orders processed.');
    }

    /**
     * Refund a single order: update status, refund wallet, restore stock.
     */
    private function refundOrder(Order $order): array
    {
        return DB::transaction(function () use ($order) {
            $order->load(['buyer', 'items', 'delivery']);

            // 1. Update order status to Dikembalikan
            $order->update(['status' => 'Dikembalikan']);

            // 2. Record status history
            OrderStatusHistory::create([
                'order_id' => $order->id,
                'status' => 'Dikembalikan',
                'note' => 'Overdue: order exceeded SLA. Auto-refunded by system.',
            ]);

            // 3. Refund to buyer's wallet
            $refundAmount = $order->total;
            $wallet = Wallet::firstOrCreate(
                ['user_id' => $order->buyer_id],
                ['balance' => 0]
            );

            $wallet->increment('balance', $refundAmount);

            WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'amount' => $refundAmount,
                'type' => 'refund',
                'description' => "Overdue refund for order #{$order->order_number}",
                'reference_type' => 'order',
                'reference_id' => $order->id,
            ]);

            // 4. Restore product stock
            $stockRestored = [];
            foreach ($order->items as $item) {
                if ($item->product_id) {
                    $product = Product::find($item->product_id);
                    if ($product) {
                        $product->increment('stock', $item->quantity);
                        $stockRestored[] = [
                            'product_id' => $product->id,
                            'product_name' => $item->product_name,
                            'quantity_restored' => $item->quantity,
                        ];
                    }
                }
            }

            // 5. Update delivery status if exists
            if ($order->delivery) {
                $order->delivery->update(['status' => 'cancelled']);
            }

            return [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'refund_amount' => (float) $refundAmount,
                'stock_restored' => $stockRestored,
                'status' => 'Dikembalikan',
            ];
        });
    }

    /**
     * Get all overdue orders. Optionally add extra hours for simulation.
     */
    private function getOverdueOrders(int $extraHours = 0)
    {
        $orders = collect();

        foreach (self::SLA_HOURS as $method => $hours) {
            $threshold = now()->subHours($hours - $extraHours);

            $methodOrders = Order::with(['buyer', 'store', 'items', 'delivery', 'statusHistories'])
                ->whereIn('status', ['Sedang Dikirim', 'Menunggu Pengirim'])
                ->where('delivery_method', $method)
                ->whereHas('delivery', function ($q) use ($threshold) {
                    $q->where('created_at', '<=', $threshold);
                })
                ->get();

            $orders = $orders->merge($methodOrders);
        }

        return $orders;
    }
}
