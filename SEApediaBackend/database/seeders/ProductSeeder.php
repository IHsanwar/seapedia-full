<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Store;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Seeds 10 realistic products (5 per store) across both seeded seller stores.
     * Requires UserAccountSeeder to have run first (to create stores).
     */
    public function run(): void
    {
        // Get the two seeded stores
        $store1 = Store::where('slug', 'toko-seapedia-1')->first();
        $store2 = Store::where('slug', 'toko-serba-ada')->first();

        if (!$store1) {
            $this->command->warn('⚠️  ProductSeeder: Store "Toko Seapedia 1" not found. Run UserAccountSeeder first.');
            return;
        }

        if (!$store2) {
            $this->command->warn('⚠️  ProductSeeder: Store "Toko Serba Ada" not found. Run UserAccountSeeder first.');
            return;
        }

        // ── Products for Toko Seapedia 1 (seller@seapedia.com) ──────────────────
        $store1Products = [
            [
                'name'        => 'Ikan Salmon Segar 500gr',
                'description' => 'Ikan salmon segar premium, kaya omega-3, cocok untuk sashimi, sushi, atau masakan sehari-hari. Dikirim dalam kondisi segar dan dingin.',
                'price'       => 85000.00,
                'stock'       => 50,
                'is_active'   => true,
            ],
            [
                'name'        => 'Udang Vaname Beku 1kg',
                'description' => 'Udang vaname kualitas ekspor, ukuran 60-70 ekor/kg. Sudah dikupas, siap masak. Cocok untuk berbagai hidangan seafood.',
                'price'       => 95000.00,
                'stock'       => 100,
                'is_active'   => true,
            ],
            [
                'name'        => 'Cumi-Cumi Segar 500gr',
                'description' => 'Cumi-cumi laut dalam kondisi segar, bersih dan bebas bau amis. Cocok untuk calamari, tumis, atau masakan berkuah.',
                'price'       => 45000.00,
                'stock'       => 75,
                'is_active'   => true,
            ],
            [
                'name'        => 'Kepiting Bakau 1 ekor (500-700gr)',
                'description' => 'Kepiting bakau hidup pilihan, berat berkisar 500-700gram per ekor. Segar dari tambak lokal. Tersedia bumbu saus tiram gratis.',
                'price'       => 120000.00,
                'stock'       => 30,
                'is_active'   => true,
            ],
            [
                'name'        => 'Kerang Hijau Rebus 500gr',
                'description' => 'Kerang hijau yang sudah direbus dan siap saji, disajikan dengan bumbu khas. Higienis dan lezat untuk camilan atau lauk.',
                'price'       => 35000.00,
                'stock'       => 80,
                'is_active'   => true,
            ],
        ];

        foreach ($store1Products as $data) {
            $slug = $this->makeUniqueSlug($data['name']);
            Product::firstOrCreate(
                ['slug' => $slug],
                array_merge($data, [
                    'store_id' => $store1->id,
                    'slug'     => $slug,
                ])
            );
        }

        // ── Products for Toko Serba Ada (multi@seapedia.com) ────────────────────
        $store2Products = [
            [
                'name'        => 'Kaos Polos Cotton 30s Unisex',
                'description' => 'Kaos polos berbahan cotton 30s yang nyaman dan adem. Tersedia dalam berbagai warna dan ukuran (S, M, L, XL, XXL). Jahitan rapi, tidak mudah melar.',
                'price'       => 75000.00,
                'stock'       => 200,
                'is_active'   => true,
            ],
            [
                'name'        => 'Sepatu Casual Sneakers Pria',
                'description' => 'Sepatu sneakers kasual pria dengan sol karet tebal dan bahan kanvas berkualitas. Cocok untuk kegiatan sehari-hari, santai, maupun semi-formal.',
                'price'       => 250000.00,
                'stock'       => 45,
                'is_active'   => true,
            ],
            [
                'name'        => 'Tas Ransel Laptop 14 inch Anti Air',
                'description' => 'Tas ransel dengan kompartemen laptop hingga 14 inch, bahan anti air. Dilengkapi port USB charging dan slot kartu. Kapasitas 30 liter.',
                'price'       => 185000.00,
                'stock'       => 60,
                'is_active'   => true,
            ],
            [
                'name'        => 'Earphone Bluetooth 5.0 Wireless',
                'description' => 'Earphone TWS Bluetooth 5.0 dengan casing charging magnetik. Daya tahan baterai 4+20 jam, noise cancellation aktif, dan kualitas suara Hi-Fi.',
                'price'       => 149000.00,
                'stock'       => 120,
                'is_active'   => true,
            ],
            [
                'name'        => 'Minyak Zaitun Extra Virgin 500ml',
                'description' => 'Minyak zaitun cold-pressed extra virgin murni, kaya antioksidan dan vitamin E. Cocok untuk memasak, salad dressing, atau perawatan kulit.',
                'price'       => 110000.00,
                'stock'       => 90,
                'is_active'   => true,
            ],
        ];

        foreach ($store2Products as $data) {
            $slug = $this->makeUniqueSlug($data['name']);
            Product::firstOrCreate(
                ['slug' => $slug],
                array_merge($data, [
                    'store_id' => $store2->id,
                    'slug'     => $slug,
                ])
            );
        }

        $this->command->info('✅ ProductSeeder: 10 products created (5 per store).');
    }

    /**
     * Generate a unique slug from a product name.
     * Appends a counter if the slug already exists.
     */
    private function makeUniqueSlug(string $name): string
    {
        $baseSlug = Str::slug($name) ?: 'product';
        $slug     = $baseSlug;
        $counter  = 2;

        while (Product::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}
