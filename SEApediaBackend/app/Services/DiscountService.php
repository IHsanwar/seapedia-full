<?php

namespace App\Services;

use App\Models\Promo;
use App\Models\Voucher;

class DiscountService
{
    /**
     * Validate and calculate voucher discount
     */
    public function validateAndCalculateVoucher(?string $voucherCode, float $subtotal): array
    {
        if (!$voucherCode) {
            return [
                'valid' => false,
                'discount' => 0,
                'voucher' => null,
                'message' => 'No voucher code provided.',
            ];
        }

        $voucher = Voucher::where('code', $voucherCode)->first();

        if (!$voucher) {
            return [
                'valid' => false,
                'discount' => 0,
                'voucher' => null,
                'message' => 'Voucher not found.',
            ];
        }

        // Check if voucher is active
        if (!$voucher->is_active) {
            return [
                'valid' => false,
                'discount' => 0,
                'voucher' => $voucher,
                'message' => 'Voucher is not active.',
            ];
        }

        // Check expiration
        if ($voucher->expired_at < now()) {
            return [
                'valid' => false,
                'discount' => 0,
                'voucher' => $voucher,
                'message' => 'Voucher has expired.',
            ];
        }

        // Check minimum purchase
        if ($voucher->minimum_purchase && $subtotal < $voucher->minimum_purchase) {
            return [
                'valid' => false,
                'discount' => 0,
                'voucher' => $voucher,
                'message' => "Minimum purchase of Rp " . number_format($voucher->minimum_purchase, 0, ',', '.') . " required.",
            ];
        }

        // Check remaining usage
        if ($voucher->remaining_usage !== null && $voucher->remaining_usage <= 0) {
            return [
                'valid' => false,
                'discount' => 0,
                'voucher' => $voucher,
                'message' => 'Voucher usage limit has been reached.',
            ];
        }

        // Calculate discount
        $discount = $this->calculateDiscount($voucher, $subtotal);

        return [
            'valid' => true,
            'discount' => $discount,
            'voucher' => $voucher,
            'message' => 'Voucher applied successfully.',
        ];
    }

    /**
     * Validate and calculate promo discount
     */
    public function validateAndCalculatePromo(?string $promoCode, float $subtotal): array
    {
        if (!$promoCode) {
            return [
                'valid' => false,
                'discount' => 0,
                'promo' => null,
                'message' => 'No promo code provided.',
            ];
        }

        $promo = Promo::where('code', $promoCode)->first();

        if (!$promo) {
            return [
                'valid' => false,
                'discount' => 0,
                'promo' => null,
                'message' => 'Promo not found.',
            ];
        }

        // Check if promo is active
        if (!$promo->is_active) {
            return [
                'valid' => false,
                'discount' => 0,
                'promo' => $promo,
                'message' => 'Promo is not active.',
            ];
        }

        // Check expiration
        if ($promo->expired_at < now()) {
            return [
                'valid' => false,
                'discount' => 0,
                'promo' => $promo,
                'message' => 'Promo has expired.',
            ];
        }

        // Check minimum purchase
        if ($promo->minimum_purchase && $subtotal < $promo->minimum_purchase) {
            return [
                'valid' => false,
                'discount' => 0,
                'promo' => $promo,
                'message' => "Minimum purchase of Rp " . number_format($promo->minimum_purchase, 0, ',', '.') . " required.",
            ];
        }

        // Calculate discount
        $discount = $this->calculatePromoDiscount($promo, $subtotal);

        return [
            'valid' => true,
            'discount' => $discount,
            'promo' => $promo,
            'message' => 'Promo applied successfully.',
        ];
    }

    /**
     * Calculate discount based on voucher type and value
     */
    private function calculateDiscount($voucher, float $subtotal): float
    {
        if ($voucher->type === 'fixed') {
            return min($voucher->value, $subtotal);
        } else {
            $discount = ($voucher->value / 100) * $subtotal;

            if ($voucher->max_discount && $discount > $voucher->max_discount) {
                $discount = $voucher->max_discount;
            }

            return min($discount, $subtotal);
        }
    }

    /**
     * Calculate discount based on promo type and value
     */
    private function calculatePromoDiscount($promo, float $subtotal): float
    {
        if ($promo->type === 'fixed') {
            return min($promo->value, $subtotal);
        } else {
            $discount = ($promo->value / 100) * $subtotal;

            if ($promo->max_discount && $discount > $promo->max_discount) {
                $discount = $promo->max_discount;
            }

            return min($discount, $subtotal);
        }
    }
}
