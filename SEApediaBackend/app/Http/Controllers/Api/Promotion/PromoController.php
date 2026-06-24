<?php

namespace App\Http\Controllers\Api\Promotion;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Promo;
use Illuminate\Http\Request;

class PromoController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of promos.
     */
    public function index()
    {
        $promos = Promo::latest()->paginate(10);
        return $this->success($promos, 'Promos retrieved successfully.');
    }

    /**
     * Display the specified promo.
     */
    public function show($id)
    {
        $promo = Promo::find($id);

        if (!$promo) {
            return $this->error('Promo not found.', null, 404);
        }

        return $this->success($promo, 'Promo retrieved successfully.');
    }

    /**
     * Store a newly created promo.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'code' => 'required|string|unique:promos,code',
            'type' => 'required|in:fixed,percent',
            'value' => 'required|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'minimum_purchase' => 'nullable|numeric|min:0',
            'expired_at' => 'required|date|after:now',
            'is_active' => 'boolean',
        ]);

        $promo = Promo::create($validatedData);

        return $this->success($promo, 'Promo created successfully.', 201);
    }

    /**
     * Update the specified promo.
     */
    public function update(Request $request, $id)
    {
        $promo = Promo::find($id);

        if (!$promo) {
            return $this->error('Promo not found.', null, 404);
        }

        $validatedData = $request->validate([
            'code' => 'sometimes|string|unique:promos,code,' . $id,
            'type' => 'sometimes|in:fixed,percent',
            'value' => 'sometimes|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'minimum_purchase' => 'nullable|numeric|min:0',
            'expired_at' => 'sometimes|date',
            'is_active' => 'boolean',
        ]);

        $promo->update($validatedData);

        return $this->success($promo, 'Promo updated successfully.');
    }

    /**
     * Remove the specified promo.
     */
    public function destroy($id)
    {
        $promo = Promo::find($id);

        if (!$promo) {
            return $this->error('Promo not found.', null, 404);
        }

        // Check if promo has been used in orders
        if ($promo->orders()->exists()) {
            return $this->error('Cannot delete promo that has been used in orders.', null, 400);
        }

        $promo->delete();

        return $this->success(null, 'Promo deleted successfully.');
    }

    /**
     * Get available promos for buyers
     */
    public function availablePromos()
    {
        $promos = Promo::where('is_active', true)
            ->where('expired_at', '>', now())
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->success($promos, 'Available promos retrieved successfully.');
    }

    /**
     * Validate and apply promo code
     */
    public function applyPromo(Request $request)
    {
        $request->validate([
            'promo_code' => 'required|string|exists:promos,code',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $promo = Promo::where('code', $request->promo_code)->first();

        if (!$promo) {
            return $this->error('Promo not found.', null, 404);
        }

        // Check if promo is active
        if (!$promo->is_active) {
            return $this->error('Promo is not active.', null, 400);
        }

        // Check expiration
        if ($promo->expired_at < now()) {
            return $this->error('Promo has expired.', null, 400);
        }

        // Check minimum purchase
        if ($promo->minimum_purchase && $request->subtotal < $promo->minimum_purchase) {
            return $this->error(
                "Minimum purchase of Rp " . number_format($promo->minimum_purchase, 0, ',', '.') . " required.",
                null,
                400
            );
        }

        // Calculate discount
        $discount = $this->calculateDiscount($promo, $request->subtotal);

        return $this->success([
            'promo' => $promo,
            'subtotal' => $request->subtotal,
            'discount' => $discount,
            'discount_formatted' => 'Rp ' . number_format($discount, 0, ',', '.'),
        ], 'Promo applied successfully.');
    }

    /**
     * Calculate discount based on promo type and value
     */
    private function calculateDiscount($promo, float $subtotal): float
    {
        if ($promo->type === 'fixed') {
            // Fixed amount discount
            return min($promo->value, $subtotal);
        } else {
            // Percentage discount
            $discount = ($promo->value / 100) * $subtotal;

            // Apply max_discount limit if set
            if ($promo->max_discount && $discount > $promo->max_discount) {
                $discount = $promo->max_discount;
            }

            return min($discount, $subtotal);
        }
    }
}
