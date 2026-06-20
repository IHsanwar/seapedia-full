<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
        ]);

        $admin = User::firstOrCreate(
            ['email' => 'admin@seapedia.com'],
            [
                'name' => 'Admin SEApedia',
                'username' => 'admin',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
            ]
        );

        $adminRole = \App\Models\Role::where('name', 'admin')->first();
        if ($adminRole && !$admin->hasRole('admin')) {
            $admin->roles()->attach($adminRole);
        }
    }
}
