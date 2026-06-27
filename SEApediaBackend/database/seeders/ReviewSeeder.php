<?php

namespace Database\Seeders;

use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Seeds sample public application reviews to demonstrate the review feature.
     * Includes both guest reviews (user_id = null) and logged-in user reviews.
     * All comments are plain text to demonstrate XSS safety.
     */
    public function run(): void
    {
        $buyer  = User::where('email', 'buyer@seapedia.com')->first();
        $seller = User::where('email', 'seller@seapedia.com')->first();

        $reviews = [
            // Guest reviews (user_id null)
            [
                'user_id'       => null,
                'reviewer_name' => 'Andi Kurniawan',
                'rating'        => 5,
                'comment'       => 'SEApedia sangat membantu saya berbelanja kebutuhan sehari-hari! Tampilannya bersih dan mudah digunakan. Proses checkout cepat dan aman.',
            ],
            [
                'user_id'       => null,
                'reviewer_name' => 'Rina Susanti',
                'rating'        => 4,
                'comment'       => 'Platform yang bagus dengan banyak pilihan produk. Saya suka fitur multi-role, bisa jadi pembeli sekaligus penjual dengan satu akun.',
            ],
            [
                'user_id'       => null,
                'reviewer_name' => 'Dedi Prasetyo',
                'rating'        => 5,
                'comment'       => 'Belanja di SEApedia sangat mudah! Pilihan metode pengiriman beragam dan harga transparan. Akan terus belanja di sini.',
            ],
            [
                'user_id'       => null,
                'reviewer_name' => 'Maya Putri',
                'rating'        => 4,
                'comment'       => 'Aplikasinya responsif dan cepat. Fitur review ini sangat berguna untuk calon pembeli lain. Semoga terus berkembang!',
            ],
            [
                'user_id'       => null,
                'reviewer_name' => 'Budi Santoso',
                'rating'        => 3,
                'comment'       => 'Secara keseluruhan sudah cukup baik. Mungkin bisa ditambahkan fitur live chat dengan seller agar komunikasi lebih mudah.',
            ],

            // Logged-in user reviews
            [
                'user_id'       => $buyer?->id,
                'reviewer_name' => 'Buyer SEApedia',
                'rating'        => 5,
                'comment'       => 'Wallet topup sangat mudah dan checkout berjalan lancar. Tracking pesanan real-time sangat membantu saya memantau status pengiriman.',
            ],
            [
                'user_id'       => $seller?->id,
                'reviewer_name' => 'Seller SEApedia',
                'rating'        => 5,
                'comment'       => 'Dashboard seller sangat intuitif untuk mengelola produk dan pesanan. Laporan pendapatan juga sangat detail. Highly recommended!',
            ],

            // More diverse guest reviews
            [
                'user_id'       => null,
                'reviewer_name' => 'Siti Rahayu',
                'rating'        => 4,
                'comment'       => 'Saya menyukai konsep marketplace multi-peran ini. Sebagai penjual sekaligus pembeli, saya bisa mengelola bisnis dan belanja dalam satu platform.',
            ],
            [
                'user_id'       => null,
                'reviewer_name' => 'Hendra Wijaya',
                'rating'        => 5,
                'comment'       => 'Fitur voucher dan promo sangat membantu menghemat pengeluaran. Discount calculation-nya akurat dan transparan di halaman checkout.',
            ],
            [
                'user_id'       => null,
                'reviewer_name' => 'Lia Amalia',
                'rating'        => 4,
                'comment'       => 'SEApedia memudahkan saya menemukan produk seafood segar dari berbagai toko. Pengiriman cepat dan produk tiba dalam kondisi baik!',
            ],
        ];

        // Only insert reviews if table is empty (idempotent)
        if (Review::count() === 0) {
            foreach ($reviews as $review) {
                // Skip if user reference is null and user field is not null
                if (isset($review['user_id']) && $review['user_id'] === null && $review['reviewer_name'] !== 'Andi Kurniawan') {
                    // This is a guest review with null user_id - always safe
                }
                Review::create($review);
            }

            $this->command->info('✅ ReviewSeeder: 10 public application reviews created.');
        } else {
            $this->command->info('ℹ️  ReviewSeeder: Reviews already exist, skipping.');
        }
    }
}
