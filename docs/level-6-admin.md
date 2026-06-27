# Level 6: Admin Monitoring and Overdue Handling — Dokumentasi Fitur

## Ringkasan Fitur

Level 6 menambahkan visibilitas penuh bagi Administrator atas marketplace SEApedia. Dengan fitur ini, Admin dapat memantau seluruh aktivitas transaksi, detail toko, status kurir, serta menangani order yang terlambat (overdue) melewati batas SLA pengiriman dengan mekanisme pengembalian dana (refund) otomatis dan pemulihan stok.

---

## 1. SLA & Mekanisme Overdue

SLA (Service Level Agreement) pengiriman dihitung sejak **Delivery Job dibuat** (ketika order berubah status menjadi `Menunggu Pengirim` atau `Sedang Dikirim`).

### Aturan SLA Pengiriman:
| Metode Pengiriman | SLA (Jam) | Konsekuensi Overdue |
|---|---|---|
| **Instant** | 3 Jam | Pesanan dibatalkan otomatis & refund wallet buyer penuh |
| **Next Day** | 28 Jam | Pesanan dibatalkan otomatis & refund wallet buyer penuh |
| **Regular** | 72 Jam | Pesanan dibatalkan otomatis & refund wallet buyer penuh |

### Alur Kerja Auto-Refund Overdue:
1. Sistem mengecek pesanan dengan status `Menunggu Pengirim` atau `Sedang Dikirim`.
2. Jika selisih waktu dari dibuatnya Delivery Job telah melebihi SLA, pesanan ditandai sebagai **Overdue**.
3. Status pesanan diubah menjadi `Dikembalikan`.
4. Dana pembayaran pesanan dikembalikan secara penuh (100%) ke Wallet pembeli (`WalletTransaction` bertipe `refund`).
5. Stok produk yang dipesan dikembalikan (increment) ke inventori penjual.
6. Status pengiriman (`Delivery`) diubah menjadi `cancelled`.

---

## 2. API Endpoints (Admin)

Seluruh endpoint admin diproteksi menggunakan Sanctum middleware dan role check `role:admin`.

### Dashboard & Statistik
- `GET /api/v1/admin/dashboard` - Ringkasan statistik (total user, store, revenue, dll)
- `GET /api/v1/admin/stats/users` - Distribusi pengguna berdasarkan role
- `GET /api/v1/admin/stats/orders` - Jumlah pesanan berdasarkan status
- `GET /api/v1/admin/stats/deliveries` - Jumlah pengiriman berdasarkan status/metode

### Monitoring Entitas
- `GET /api/v1/admin/stores` - Daftar semua toko (dengan fitur pencarian)
- `GET /api/v1/admin/stores/{id}` - Detail lengkap toko beserta produknya
- `GET /api/v1/admin/products` - Daftar semua produk di marketplace
- `GET /api/v1/admin/orders` - Daftar semua pesanan dengan filter status
- `GET /api/v1/admin/orders/{id}` - Detail pesanan lengkap dengan riwayat status
- `GET /api/v1/admin/deliveries` - Daftar seluruh pengiriman barang oleh driver
- `GET /api/v1/admin/deliveries/{id}` - Detail informasi pengiriman barang

### Overdue & Simulasi
- `GET /api/v1/admin/overdue-orders` - Daftar pesanan yang terdeteksi overdue saat ini
- `POST /api/v1/admin/overdue/process` - Memicu pemrosesan & refund otomatis seluruh pesanan overdue
- `POST /api/v1/admin/overdue/{order}/refund` - Memicu refund manual untuk satu pesanan overdue spesifik
- `POST /api/v1/admin/simulate-next-day` - Simulasi waktu maju $N$ jam ke depan untuk memicu overdue secara artifisial (khusus demo/testing)

---

## 3. Fitur Frontend Admin

Frontend admin diimplementasikan menggunakan UI premium berbasis Shadcn & Tailwind CSS:

1. **Dashboard Monitoring (`/admin/dashboard`)**
   - Menampilkan total users, stores, products, orders, active deliveries, revenue, dan counter overdue orders.
2. **Monitor Orders (`/admin/orders`)**
   - Daftar pesanan dengan pencarian nomor pesanan, filter status, navigasi halaman (pagination), dan dialog pop-up detail pesanan.
3. **Monitor Stores (`/admin/stores`)**
   - Grid toko-toko terdaftar dengan info pemilik, jumlah produk, status aktif, dan pop-up detail produk.
4. **Monitor Deliveries (`/admin/deliveries`)**
   - Daftar penugasan kurir (driver), status pengambilan barang (`taken_at`, `completed_at`), dan filter status.
5. **Overdue SLA Handling (`/admin/overdue`)**
   - Halaman khusus mendeteksi pesanan overdue dengan tombol aksi cepat untuk melakukan refund manual per-pesanan atau batch refund sekaligus. Juga dilengkapi slider simulasi waktu maju untuk tujuan pengujian.
6. **Promo & Voucher Management (`/admin/promos`, `/admin/vouchers`)**
   - CRUD antarmuka lengkap untuk mengelola kode promo global dan voucher belanja.

---

## 4. Perintah Artisan (CLI)

Admin juga dapat menjalankan pengecekan otomatis melalui command line scheduler:

```bash
# Mengecek dan memproses refund seluruh pesanan overdue
php artisan app:process-overdue-orders

# Melakukan simulasi pengecekan tanpa mengubah database (Dry Run)
php artisan app:process-overdue-orders --dry-run
```
