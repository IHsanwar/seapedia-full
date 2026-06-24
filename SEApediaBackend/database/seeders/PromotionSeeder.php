<?php

namespace Database\Seeders;

use App\Models\Promo;
use App\Models\Voucher;
use Illuminate\Database\Seeder;

class PromotionSeeder extends Seeder
{
    public function run(): void
    {
        Voucher::create([
            'code' => 'DISC50',
            'type' => 'percent',
            'value' => 50,
            'max_discount' => 100000,
            'minimum_purchase' => 50000,
            'remaining_usage' => 100,
            'expired_at' => now()->addMonths(6),
            'is_active' => true,
        ]);

        Voucher::create([
            'code' => 'DISC25K',
            'type' => 'fixed',
            'value' => 25000,
            'minimum_purchase' => 100000,
            'remaining_usage' => 50,
            'expired_at' => now()->addMonths(3),
            'is_active' => true,
        ]);

        Voucher::create([
            'code' => 'WELCOME10',
            'type' => 'percent',
            'value' => 10,
            'max_discount' => 50000,
            'minimum_purchase' => 0,
            'remaining_usage' => 16, // unlimited
            'expired_at' => now()->addYear(),
            'is_active' => true,
        ]);

        // Create sample promos
        Promo::create([
            'code' => 'MEGA2026',
            'type' => 'percent',
            'value' => 30,
            'max_discount' => 150000,
            'minimum_purchase' => 200000,
            'expired_at' => now()->addMonths(12),
            'is_active' => true,
        ]);

        Promo::create([
            'code' => 'FLASH50K',
            'type' => 'fixed',
            'value' => 50000,
            'minimum_purchase' => 250000,
            'expired_at' => now()->addWeeks(2),
            'is_active' => true,
        ]);

        Promo::create([
            'code' => 'FREESHIP',
            'type' => 'fixed',
            'value' => 20000,
            'minimum_purchase' => 150000,
            'expired_at' => now()->addMonth(),
            'is_active' => true,
        ]);
    }
}
