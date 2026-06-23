<?php

namespace App\Http\Controllers\Api\Buyer;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Buyer\Order\CheckoutRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\CheckoutService;
use Illuminate\Support\Facades\Auth;
use App\Models\Voucher;
use Illuminate\Http\Request;
class OrderController extends Controller
{
    use ApiResponse;

    private CheckoutService $checkoutService;

    public function __construct(CheckoutService $checkoutService)
    {
        $this->checkoutService = $checkoutService;
    }

    public function index()
    {
        $user = Auth::user();
        $orders = $user->orders()->with(['items.product', 'store', 'address', 'statusHistories'])->latest()->get();

        return $this->success(
            OrderResource::collection($orders),
            'Orders retrieved successfully.'
        );
    }

    public function show(string $id)
    {
        $user = Auth::user();
        $order = $user->orders()->with(['items.product', 'store', 'address', 'statusHistories'])->find($id);

        if (!$order) {
            return $this->error('Order not found.', null, 404);
        }

        return $this->success(
            new OrderResource($order),
            'Order retrieved successfully.'
        );
    }

    public function checkout(CheckoutRequest $request)
    {
        $user = Auth::user();

        try {
            $order = $this->checkoutService->processCheckout(
                $user->id,
                $request->address_id,
                $request->delivery_method,
                $request->voucher_code ?? null
            );

            return $this->success(
                new OrderResource($order),
                'Order created successfully.',
                201
            );
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), null, 400);
        }
    }

    public function applyVoucher(Request $request)
    {
        $request->validate([
            'voucher_code' => 'required|string|exists:vouchers,code',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $voucher = Voucher::where('code', $request->voucher_code)->first();

        if (!$voucher) {
            return $this->error('Voucher not found.', null, 404);
        }

        // Check if voucher is active
        if (!$voucher->is_active) {
            return $this->error('Voucher is not active.', null, 400);
        }

        // Check expiration
        if ($voucher->expired_at < now()) {
            return $this->error('Voucher has expired.', null, 400);
        }

        // Check minimum purchase
        if ($voucher->minimum_purchase && $request->subtotal < $voucher->minimum_purchase) {
            return $this->error(
                "Minimum purchase of Rp " . number_format($voucher->minimum_purchase, 0, ',', '.') . " required.",
                null,
                400
            );
        }

        // Check remaining usage
        if ($voucher->remaining_usage !== null && $voucher->remaining_usage <= 0) {
            return $this->error('Voucher usage limit has been reached.', null, 400);
        }

        // Calculate discount
        $discount = $this->calculateDiscount($voucher, $request->subtotal);

        return $this->success([
            'voucher' => $voucher,
            'subtotal' => $request->subtotal,
            'discount' => $discount,
            'discount_formatted' => 'Rp ' . number_format($discount, 0, ',', '.'),
        ], 'Voucher applied successfully.');
    }

    /**
     * Calculate discount based on voucher type and value
     */
    private function calculateDiscount($voucher, $subtotal): float
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