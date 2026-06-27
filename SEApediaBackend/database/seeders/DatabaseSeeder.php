<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            // 1. Roles (must be first - required by UserAccountSeeder)
            RoleSeeder::class,

            // 2. User Accounts: admin, buyer, seller, driver (+ wallet + store + driver profile)
            UserAccountSeeder::class,

            // 3. Categories (no dependencies)
            CategorySeeder::class,

            // 4. Products (requires stores from UserAccountSeeder)
            ProductSeeder::class,

            // 5. Addresses (requires users from UserAccountSeeder)
            AddressSeeder::class,

            // 6. Vouchers and Promos (no dependencies)
            PromotionSeeder::class,

            // 7. Public application reviews (requires users, but allows null user_id for guests)
            ReviewSeeder::class,
        ]);

        $this->command->info('');
        $this->command->info('=============================================');
        $this->command->info('   ✅ All seeders completed successfully!    ');
        $this->command->info('=============================================');
        $this->command->info('');
        $this->command->info('📋 Demo Accounts (password: "password"):');
        $this->command->info('  admin@seapedia.com    → Role: Admin');
        $this->command->info('  buyer@seapedia.com    → Role: Buyer');
        $this->command->info('  seller@seapedia.com   → Roles: Seller + Buyer');
        $this->command->info('  driver@seapedia.com   → Roles: Driver + Buyer');
        $this->command->info('  multi@seapedia.com    → Roles: Seller + Buyer + Driver');
        $this->command->info('');
        $this->command->info('🛒 Voucher Codes:');
        $this->command->info('  DISC50    → 50% off (max Rp100k, min purchase Rp50k)');
        $this->command->info('  DISC25K   → Rp25.000 off (min purchase Rp100k)');
        $this->command->info('  WELCOME10 → 10% off (max Rp50k, no min purchase)');
        $this->command->info('');
        $this->command->info('🎁 Promo Codes:');
        $this->command->info('  MEGA2026  → 30% off (max Rp150k, min purchase Rp200k)');
        $this->command->info('  FLASH50K  → Rp50.000 off (min purchase Rp250k)');
        $this->command->info('  FREESHIP  → Rp20.000 off (min purchase Rp150k)');
        $this->command->info('');
        $this->command->info('📦 Seeded Data Summary:');
        $this->command->info('  5 Users | 2 Stores | 10 Products | 17 Categories');
        $this->command->info('  3 Vouchers | 3 Promos | Sample Addresses | 10 Reviews');
        $this->command->info('');
    }
}
