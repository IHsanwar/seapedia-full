<?php

namespace App\Services;

use App\Models\Address;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderDiscount;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\Voucher;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;

class CheckoutService
{
    public function __construct()
    {
    }

    public function processCheckout(int $userId, int $addressId, string $deliveryMethod, ?string $voucherCode = null)
    {
        return DB::transaction(function () use ($userId, $addressId, $deliveryMethod, $voucherCode) {
            $cart = Cart::with(['items.product', 'store'])->where('user_id', $userId)->first();

            if (!$cart || $cart->items->isEmpty()) {
                throw new \Exception('Cart is empty.');
            }

            $address = Address::where('id', $addressId)->where('user_id', $userId)->first();

            if (!$address) {
                throw new \Exception('Address not found.');
            }

            $storeId = $cart->store_id;

            if (!$storeId) {
                throw new \Exception('Cart does not have a store.');
            }

            $subtotal = 0;
            $orderItemsData = [];

            foreach ($cart->items as $item) {
                $product = $item->product;

                if (!$product) {
                    throw new \Exception('Product not found.');
                }

                if ($product->stock < $item->quantity) {
                    throw new \Exception("Insufficient stock for product: {$product->name}");
                }

                $itemSubtotal = $product->price * $item->quantity;
                $subtotal += $itemSubtotal;

                $orderItemsData[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'price' => $product->price,
                    'quantity' => $item->quantity,
                    'subtotal' => $itemSubtotal,
                ];
            }

            $deliveryFee = $this->getDeliveryFee($deliveryMethod);

            // Process voucher if provided
            $discount = 0;
            $voucher = null;
            $voucherId = null;

            if ($voucherCode) {
                $voucher = Voucher::where('code', $voucherCode)->first();

                if ($voucher && $this->validateVoucher($voucher, $subtotal)) {
                    $discount = $this->calculateDiscount($voucher, $subtotal);
                    $voucherId = $voucher->id;

                    // Decrement remaining usage
                    if ($voucher->remaining_usage !== null) {
                        $voucher->decrement('remaining_usage');
                    }
                }
            }

            $tax = $subtotal * 0.12;

            $total = $subtotal + $deliveryFee + $tax - $discount;

            $wallet = Wallet::where('user_id', $userId)->first();

            if (!$wallet) {
                $wallet = Wallet::create([
                    'user_id' => $userId,
                    'balance' => 0,
                ]);
            }

            if ($wallet->balance < $total) {
                throw new \Exception('Insufficient wallet balance.');
            }

            $orderNumber = $this->generateOrderNumber();

            $order = Order::create([
                'order_number' => $orderNumber,
                'buyer_id' => $userId,
                'store_id' => $storeId,
                'address_id' => $addressId,
                'delivery_method' => $deliveryMethod,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'delivery_fee' => $deliveryFee,
                'tax' => $tax,
                'total' => $total,
                'status' => 'Sedang Dikemas',
                'voucher_id' => $voucherId,
            ]);

            // Create order discount record if voucher was used
            if ($voucher && $discount > 0) {
                OrderDiscount::create([
                    'order_id' => $order->id,
                    'discount_type' => 'voucher',
                    'discount_code' => $voucher->code,
                    'discount_value' => $discount,
                ]);
            }

            foreach ($orderItemsData as $itemData) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $itemData['product_id'],
                    'product_name' => $itemData['product_name'],
                    'price' => $itemData['price'],
                    'quantity' => $itemData['quantity'],
                    'subtotal' => $itemData['subtotal'],
                ]);
            }

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'status' => 'Sedang Dikemas',
                'note' => 'Order created',
            ]);

            $wallet->update([
                'balance' => $wallet->balance - $total,
            ]);

            WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'amount' => -$total,
                'type' => 'payment',
                'description' => "Payment for order {$orderNumber}",
            ]);

            foreach ($cart->items as $item) {
                $product = $item->product;
                $product->update([
                    'stock' => $product->stock - $item->quantity,
                ]);
            }

            $cart->items()->delete();
            $cart->update([
                'store_id' => null,
            ]);

            return $order->load(['items.product', 'store', 'address', 'statusHistories']);
        });
    }

    private function getDeliveryFee(string $deliveryMethod): float
    {
        return match ($deliveryMethod) {
            'instant' => 15000,
            'next_day' => 10000,
            'regular' => 5000,
            default => throw new \Exception('Invalid delivery method.'),
        };
    }

    private function generateOrderNumber(): string
    {
        $prefix = 'ORD';
        $timestamp = now()->format('Ymd');
        $random = strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 6));

        return "{$prefix}-{$timestamp}-{$random}";
    }

    /**
     * Validate voucher for checkout
     */
    private function validateVoucher(Voucher $voucher, float $subtotal): bool
    {
        // Check if voucher is active
        if (!$voucher->is_active) {
            return false;
        }

        // Check expiration
        if ($voucher->expired_at < now()) {
            return false;
        }

        // Check minimum purchase
        if ($voucher->minimum_purchase && $subtotal < $voucher->minimum_purchase) {
            return false;
        }

        // Check remaining usage
        if ($voucher->remaining_usage !== null && $voucher->remaining_usage <= 0) {
            return false;
        }

        return true;
    }

    /**
     * Calculate discount based on voucher type and value
     */
    private function calculateDiscount(Voucher $voucher, float $subtotal): float
    {
        if ($voucher->type === 'fixed') {
            // Fixed amount discount
            return min($voucher->value, $subtotal);
        } else {
            // Percentage discount
            $discount = ($voucher->value / 100) * $subtotal;

            // Apply max_discount limit if set
            if ($voucher->max_discount && $discount > $voucher->max_discount) {
                $discount = $voucher->max_discount;
            }

            return min($discount, $subtotal);
        }
    }
}