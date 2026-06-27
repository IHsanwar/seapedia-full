<?php

namespace Database\Seeders;

use App\Models\Promo;
use App\Models\Voucher;
use Illuminate\Database\Seeder;

class PromotionSeeder extends Seeder
{
    public function run(): void
    {
        // ── Vouchers ────────────────────────────────────────────────────────────
        // Voucher: Percentage discount with cap
        Voucher::firstOrCreate(
            ['code' => 'DISC50'],
            [
                'type'             => 'percent',
                'value'            => 50,
                'max_discount'     => 100000,
                'minimum_purchase' => 50000,
                'remaining_usage'  => 100,
                'expired_at'       => now()->addMonths(6),
                'is_active'        => true,
            ]
        );

        // Voucher: Fixed amount discount
        Voucher::firstOrCreate(
            ['code' => 'DISC25K'],
            [
                'type'             => 'fixed',
                'value'            => 25000,
                'max_discount'     => null,
                'minimum_purchase' => 100000,
                'remaining_usage'  => 50,
                'expired_at'       => now()->addMonths(3),
                'is_active'        => true,
            ]
        );

        // Voucher: Welcome discount (no minimum purchase)
        Voucher::firstOrCreate(
            ['code' => 'WELCOME10'],
            [
                'type'             => 'percent',
                'value'            => 10,
                'max_discount'     => 50000,
                'minimum_purchase' => 0,
                'remaining_usage'  => 999, // effectively unlimited
                'expired_at'       => now()->addYear(),
                'is_active'        => true,
            ]
        );

        // ── Promos ───────────────────────────────────────────────────────────────
        // Promo: Mega sale
        Promo::firstOrCreate(
            ['code' => 'MEGA2026'],
            [
                'type'             => 'percent',
                'value'            => 30,
                'max_discount'     => 150000,
                'minimum_purchase' => 200000,
                'expired_at'       => now()->addMonths(12),
                'is_active'        => true,
            ]
        );

        // Promo: Flash sale fixed
        Promo::firstOrCreate(
            ['code' => 'FLASH50K'],
            [
                'type'             => 'fixed',
                'value'            => 50000,
                'max_discount'     => null,
                'minimum_purchase' => 250000,
                'expired_at'       => now()->addWeeks(2),
                'is_active'        => true,
            ]
        );

        // Promo: Free shipping simulation
        Promo::firstOrCreate(
            ['code' => 'FREESHIP'],
            [
                'type'             => 'fixed',
                'value'            => 20000,
                'max_discount'     => null,
                'minimum_purchase' => 150000,
                'expired_at'       => now()->addMonth(),
                'is_active'        => true,
            ]
        );

        $this->command->info('✅ PromotionSeeder: 3 vouchers and 3 promos created.');
    }
}
