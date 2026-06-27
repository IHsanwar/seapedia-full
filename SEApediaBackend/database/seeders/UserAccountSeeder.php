<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Role;
use App\Models\Wallet;
use App\Models\Store;
use App\Models\Driver;

class UserAccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get roles
        $buyerRole = Role::where('name', 'buyer')->first();
        $sellerRole = Role::where('name', 'seller')->first();
        $driverRole = Role::where('name', 'driver')->first();
        $adminRole = Role::where('name', 'admin')->first();

        // 1. Admin Account
        $admin = User::firstOrCreate(
            ['email' => 'admin@seapedia.com'],
            [
                'name' => 'Admin SEApedia',
                'username' => 'admin',
                'phone' => '081200000001',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $admin->roles()->syncWithoutDetaching([$adminRole->id]);
        $this->createWallet($admin);

        // 2. Buyer Account
        $buyer = User::firstOrCreate(
            ['email' => 'buyer@seapedia.com'],
            [
                'name' => 'Buyer SEApedia',
                'username' => 'buyer_1',
                'phone' => '081200000002',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $buyer->roles()->syncWithoutDetaching([$buyerRole->id]);
        $this->createWallet($buyer);

        // 3. Seller Account
        $seller = User::firstOrCreate(
            ['email' => 'seller@seapedia.com'],
            [
                'name' => 'Seller SEApedia',
                'username' => 'seller_1',
                'phone' => '081200000003',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $seller->roles()->syncWithoutDetaching([$sellerRole->id, $buyerRole->id]);
        $this->createWallet($seller);
        $this->createStore($seller, 'Toko Seapedia 1', 'toko-seapedia-1');

        // 4. Driver Account
        $driver = User::firstOrCreate(
            ['email' => 'driver@seapedia.com'],
            [
                'name' => 'Driver SEApedia',
                'username' => 'driver_1',
                'phone' => '081200000004',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $driver->roles()->syncWithoutDetaching([$driverRole->id, $buyerRole->id]);
        $this->createWallet($driver);
        $this->createDriver($driver, 'Motor', 'B 1234 ABC');

        // 5. Multirole Account (Buyer, Seller, Driver)
        $multi = User::firstOrCreate(
            ['email' => 'multi@seapedia.com'],
            [
                'name' => 'Multi Role SEApedia',
                'username' => 'multi_role',
                'phone' => '081200000005',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $multi->roles()->syncWithoutDetaching([$buyerRole->id, $sellerRole->id, $driverRole->id]);
        $this->createWallet($multi);
        $this->createStore($multi, 'Toko Serba Ada', 'toko-serba-ada');
        $this->createDriver($multi, 'Mobil', 'B 9999 XYZ');
    }

    private function createWallet(User $user): void
    {
        Wallet::firstOrCreate(
            ['user_id' => $user->id],
            [
                'balance' => 1000000, // 1 Million starting balance
            ]
        );
    }

    private function createStore(User $user, string $storeName, string $slug): void
    {
        Store::firstOrCreate(
            ['user_id' => $user->id],
            [
                'store_name' => $storeName,
                'slug' => $slug,
                'phone' => $user->phone,
                'address' => 'Jl. Kebon Jeruk No. 1, Jakarta Barat',
                'description' => 'Toko resmi yang dikelola secara profesional.',
                'is_active' => true,
            ]
        );
    }

    private function createDriver(User $user, string $vehicleType, string $plateNumber): void
    {
        Driver::firstOrCreate(
            ['user_id' => $user->id],
            [
                'name' => $user->name,
                'phone_number' => $user->phone,
                'vehicle_type' => $vehicleType,
                'vehicle_plate_number' => $plateNumber,
                'is_active' => true,
            ]
        );
    }
}
