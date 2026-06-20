<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        Role::insert([

            [
                'name' => 'admin',
                'display_name' => 'Administrator',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'name' => 'seller',
                'display_name' => 'Seller',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'name' => 'buyer',
                'display_name' => 'Buyer',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'name' => 'driver',
                'display_name' => 'Driver',
                'created_at' => now(),
                'updated_at' => now(),
            ],

        ]);
    }
}