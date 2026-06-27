<?php

namespace App\Console\Commands;

use App\Models\Delivery;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ProcessOverdueOrders extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'app:process-overdue-orders
                            {--dry-run : Show overdue orders without processing}';

    /**
     * The console command description.
     */
    protected $description = 'Process all overdue orders: refund wallet, restore stock, update status';

    /**
     * SLA definitions in hours per delivery method.
     */
    private const SLA_HOURS = [
        'instant'  => 3,
        'next_day' => 28,
        'regular'  => 72,
    ];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Checking for overdue orders...');

        $overdueOrders = $this->getOverdueOrders();

        if ($overdueOrders->isEmpty()) {
            $this->info('✅ No overdue orders found.');
            return Command::SUCCESS;
        }

        $this->info("⚠️  Found {$overdueOrders->count()} overdue order(s).");

        if ($this->option('dry-run')) {
            $this->table(
                ['Order ID', 'Order Number', 'Status', 'Method', 'Total', 'Delivery Created'],
                $overdueOrders->map(function ($order) {
                    return [
                        $order->id,
                        $order->order_number,
                        $order->status,
                        $order->delivery_method,
                        'Rp ' . number_format($order->total, 0, ',', '.'),
                        $order->delivery?->created_at?->toDateTimeString() ?? '-',
                    ];
                })
            );
            $this->info('ℹ️  Dry run: no changes made.');
            return Command::SUCCESS;
        }

        $processed = 0;
        $errors = 0;

        foreach ($overdueOrders as $order) {
            try {
                $this->processOrder($order);
                $processed++;
                $this->line("  ✅ Order #{$order->order_number} refunded.");
            } catch (\Exception $e) {
                $errors++;
                $this->error("  ❌ Order #{$order->order_number}: {$e->getMessage()}");
            }
        }

        $this->newLine();
        $this->info("📊 Processed: {$processed} | Errors: {$errors}");

        return $errors > 0 ? Command::FAILURE : Command::SUCCESS;
    }

    /**
     * Process a single overdue order.
     */
    private function processOrder(Order $order): void
    {
        DB::transaction(function () use ($order) {
            $order->load(['buyer', 'items', 'delivery']);

            // 1. Update order status
            $order->update(['status' => 'Dikembalikan']);

            // 2. Record status history
            OrderStatusHistory::create([
                'order_id' => $order->id,
                'status' => 'Dikembalikan',
                'note' => 'Overdue: exceeded SLA. Auto-processed by system command.',
            ]);

            // 3. Refund to buyer's wallet
            $wallet = Wallet::firstOrCreate(
                ['user_id' => $order->buyer_id],
                ['balance' => 0]
            );

            $wallet->increment('balance', $order->total);

            WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'amount' => $order->total,
                'type' => 'refund',
                'description' => "Overdue refund for order #{$order->order_number}",
                'reference_type' => 'order',
                'reference_id' => $order->id,
            ]);

            // 4. Restore product stock
            foreach ($order->items as $item) {
                if ($item->product_id) {
                    Product::where('id', $item->product_id)
                        ->increment('stock', $item->quantity);
                }
            }

            // 5. Cancel delivery if exists
            if ($order->delivery) {
                $order->delivery->update(['status' => 'cancelled']);
            }
        });
    }

    /**
     * Get all currently overdue orders.
     */
    private function getOverdueOrders()
    {
        $orders = collect();

        foreach (self::SLA_HOURS as $method => $hours) {
            $threshold = now()->subHours($hours);

            $methodOrders = Order::with(['buyer', 'items', 'delivery'])
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
