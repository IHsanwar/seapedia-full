<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\User;
use Illuminate\Database\Seeder;

class AddressSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Seeds realistic delivery addresses for all buyer-capable users.
     * Required for checkout flow demo.
     */
    public function run(): void
    {
        $users = [
            'buyer@seapedia.com',
            'seller@seapedia.com',
            'driver@seapedia.com',
            'multi@seapedia.com',
        ];

        $addressData = [
            'buyer@seapedia.com' => [
                [
                    'label'           => 'Rumah',
                    'recipient_name'  => 'Buyer SEApedia',
                    'recipient_phone' => '081200000002',
                    'address'         => 'Jl. Merdeka No. 45, RT 03 RW 07',
                    'city'            => 'Jakarta Selatan',
                    'postal_code'     => '12460',
                    'province'        => 'DKI Jakarta',
                    'is_default'      => true,
                    'notes'           => 'Pintu depan warna biru, dekat minimarket',
                ],
                [
                    'label'           => 'Kantor',
                    'recipient_name'  => 'Buyer SEApedia',
                    'recipient_phone' => '081200000002',
                    'address'         => 'Gedung Graha Mandiri Lt. 12, Jl. Imam Bonjol No. 61',
                    'city'            => 'Jakarta Pusat',
                    'postal_code'     => '10310',
                    'province'        => 'DKI Jakarta',
                    'is_default'      => false,
                    'notes'           => 'Resepsionis lantai 12, nama: Buyer SEApedia',
                ],
            ],
            'seller@seapedia.com' => [
                [
                    'label'           => 'Rumah',
                    'recipient_name'  => 'Seller SEApedia',
                    'recipient_phone' => '081200000003',
                    'address'         => 'Jl. Kebon Jeruk Raya No. 22, RT 01 RW 05',
                    'city'            => 'Jakarta Barat',
                    'postal_code'     => '11530',
                    'province'        => 'DKI Jakarta',
                    'is_default'      => true,
                    'notes'           => 'Rumah cat putih, pagar hitam',
                ],
            ],
            'driver@seapedia.com' => [
                [
                    'label'           => 'Rumah',
                    'recipient_name'  => 'Driver SEApedia',
                    'recipient_phone' => '081200000004',
                    'address'         => 'Jl. Raya Bekasi KM 18, Perumahan Harapan Indah Blok C No. 7',
                    'city'            => 'Bekasi',
                    'postal_code'     => '17131',
                    'province'        => 'Jawa Barat',
                    'is_default'      => true,
                    'notes'           => 'Sebelah warung Pak Budi',
                ],
            ],
            'multi@seapedia.com' => [
                [
                    'label'           => 'Alamat Utama',
                    'recipient_name'  => 'Multi Role SEApedia',
                    'recipient_phone' => '081200000005',
                    'address'         => 'Jl. Sudirman No. 100, Komplek Bisnis Terpadu, Unit B-05',
                    'city'            => 'Surabaya',
                    'postal_code'     => '60271',
                    'province'        => 'Jawa Timur',
                    'is_default'      => true,
                    'notes'           => 'Hubungi nomor di atas sebelum datang',
                ],
                [
                    'label'           => 'Gudang',
                    'recipient_name'  => 'Multi Role SEApedia',
                    'recipient_phone' => '081200000005',
                    'address'         => 'Jl. Rungkut Industri No. 5, Kawasan Industri SIER',
                    'city'            => 'Surabaya',
                    'postal_code'     => '60293',
                    'province'        => 'Jawa Timur',
                    'is_default'      => false,
                    'notes'           => 'Gudang nomor 5B, buka Senin-Sabtu 08:00-17:00',
                ],
            ],
        ];

        foreach ($addressData as $email => $addresses) {
            $user = User::where('email', $email)->first();

            if (!$user) {
                $this->command->warn("⚠️  AddressSeeder: User {$email} not found.");
                continue;
            }

            foreach ($addresses as $addr) {
                // Check if this exact address already exists for the user
                $exists = Address::where('user_id', $user->id)
                    ->where('label', $addr['label'])
                    ->exists();

                if (!$exists) {
                    Address::create(array_merge($addr, ['user_id' => $user->id]));
                }
            }
        }

        $this->command->info('✅ AddressSeeder: Delivery addresses created for buyer accounts.');
    }
}
