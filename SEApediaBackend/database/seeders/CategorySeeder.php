<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Seeds 17 product categories covering all major e-commerce verticals
     * relevant to SEAPEDIA's maritime/ocean-themed marketplace.
     *
     * NOTE: Requires the 'categories' table to exist via migration.
     */
    public function run(): void
    {
        // Gracefully skip if categories table doesn't exist yet
        if (!Schema::hasTable('categories')) {
            $this->command->warn('⚠️  CategorySeeder: Table "categories" does not exist. Run migration first.');
            return;
        }

        $categories = [
            // Elektronik & Gadget
            [
                'name' => 'Elektronik',
                'slug' => 'elektronik',
                'description' => 'Produk elektronik, gadget, dan aksesori digital',
            ],
            [
                'name' => 'Handphone & Tablet',
                'slug' => 'handphone-tablet',
                'description' => 'Smartphone, tablet, dan aksesori mobile',
            ],
            [
                'name' => 'Komputer & Laptop',
                'slug' => 'komputer-laptop',
                'description' => 'Komputer, laptop, dan periferal',
            ],

            // Fashion
            [
                'name' => 'Fashion Pria',
                'slug' => 'fashion-pria',
                'description' => 'Pakaian, sepatu, dan aksesori pria',
            ],
            [
                'name' => 'Fashion Wanita',
                'slug' => 'fashion-wanita',
                'description' => 'Pakaian, sepatu, dan aksesori wanita',
            ],
            [
                'name' => 'Fashion Anak',
                'slug' => 'fashion-anak',
                'description' => 'Pakaian dan aksesori anak-anak',
            ],

            // Rumah & Dapur
            [
                'name' => 'Rumah & Dapur',
                'slug' => 'rumah-dapur',
                'description' => 'Peralatan rumah tangga, furnitur, dan dekorasi',
            ],
            [
                'name' => 'Peralatan Dapur',
                'slug' => 'peralatan-dapur',
                'description' => 'Perlengkapan masak dan peralatan makan',
            ],

            // Makanan & Minuman
            [
                'name' => 'Makanan & Minuman',
                'slug' => 'makanan-minuman',
                'description' => 'Produk makanan, minuman, dan camilan',
            ],
            [
                'name' => 'Seafood & Produk Laut',
                'slug' => 'seafood-produk-laut',
                'description' => 'Ikan segar, kerang, udang, dan produk laut lainnya',
            ],

            // Kesehatan & Kecantikan
            [
                'name' => 'Kesehatan & Kecantikan',
                'slug' => 'kesehatan-kecantikan',
                'description' => 'Produk kesehatan, vitamin, dan suplemen',
            ],
            [
                'name' => 'Skincare & Kosmetik',
                'slug' => 'skincare-kosmetik',
                'description' => 'Produk perawatan kulit dan kosmetik',
            ],

            // Olahraga & Outdoor
            [
                'name' => 'Olahraga & Outdoor',
                'slug' => 'olahraga-outdoor',
                'description' => 'Peralatan olahraga dan aktivitas luar ruangan',
            ],

            // Otomotif
            [
                'name' => 'Otomotif',
                'slug' => 'otomotif',
                'description' => 'Aksesori dan perlengkapan kendaraan',
            ],

            // Buku & Pendidikan
            [
                'name' => 'Buku & Pendidikan',
                'slug' => 'buku-pendidikan',
                'description' => 'Buku, materi pendidikan, dan alat tulis',
            ],

            // Hobi & Koleksi
            [
                'name' => 'Hobi & Koleksi',
                'slug' => 'hobi-koleksi',
                'description' => 'Produk hobi, mainan, dan barang koleksi',
            ],

            // Lainnya
            [
                'name' => 'Lainnya',
                'slug' => 'lainnya',
                'description' => 'Produk lain yang tidak termasuk kategori di atas',
            ],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }

        $this->command->info('✅ CategorySeeder: 17 categories created.');
    }
}
