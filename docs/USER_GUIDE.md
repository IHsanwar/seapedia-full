# 🌊 SEAPEDIA — Panduan Pengguna (User Guide)

Selamat datang di **SEApedia**, platform *e-commerce* khusus yang dirancang untuk memfasilitasi transaksi produk makanan dan perikanan laut. Sistem ini mendukung multi-peran (Admin, Seller, Buyer, dan Driver) untuk memberikan pengalaman terintegrasi dari hulu ke hilir—mulai dari mencari produk hingga proses pengiriman.

---

## 🧑‍💻 Peran Pengguna (Roles)

SEApedia mendukung empat peran utama. Sistem ini sangat fleksibel, sehingga satu pengguna dapat memiliki lebih dari satu peran (misalnya: seorang Seller juga bisa berperan sebagai Buyer).

1. **Admin**: Pengelola sistem yang memiliki akses ke dashboard statistik (pengguna, transaksi, pengiriman), manajemen *voucher/promo*, pemrosesan *overdue order*, dan lain-lain.
2. **Buyer**: Pembeli yang dapat menelusuri katalog, menambahkan produk ke keranjang, menggunakan promo/voucher, dan melakukan transaksi melalui dompet digital (*wallet*).
3. **Seller**: Penjual yang mengelola toko, katalog produk, inventaris stok, laporan pendapatan, serta memproses pesanan yang masuk dari *buyer*.
4. **Driver**: Pihak logistik atau kurir yang memiliki profil kendaraan. Driver dapat mengambil (*take*) dan menyelesaikan (*complete*) pekerjaan pengiriman yang masuk.

---

## 🔑 Akun Demo (Untuk Pengujian)

Untuk mempermudah penggunaan awal (jika Anda menggunakan database *seeder* bawaan), sistem telah menyediakan beberapa akun demo. 

**Catatan:** Semua akun menggunakan password: **`password`**

- **Admin**: `admin@seapedia.com`
- **Buyer**: `buyer@seapedia.com` (Sudah dilengkapi dengan *wallet* berisi Rp 1.000.000 dan alamat default)
- **Seller**: `seller@seapedia.com` (Toko Seapedia 1 - Fokus pada Produk Seafood)
- **Driver**: `driver@seapedia.com` (Sudah memiliki profil kendaraan aktif)
- **Multi-Role**: `multi@seapedia.com` (Akun gabungan: Seller + Buyer + Driver untuk pengujian penuh)

---

## 🛒 Alur Sistem & Penggunaan

### 1. Alur Berbelanja (Buyer Flow)
1. **Login**: Masuk sebagai *buyer* (atau akun multi).
2. **Wallet & Alamat**: Pastikan Anda memiliki saldo *wallet* (disediakan Rp 1 juta pada akun seeder) dan minimal satu alamat pengiriman.
3. **Katalog & Keranjang**: Jelajahi katalog produk, pilih barang (misalnya Ikan Salmon Segar atau Udang Vaname), lalu tambahkan ke keranjang.
4. **Checkout & Promo**: Masuk ke halaman *checkout*, pilih metode pengiriman. Anda bisa menerapkan *voucher* yang tersedia (contoh kode: `DISC50` diskon 50%, atau `DISC25K` potong Rp 25.000).
5. **Bayar**: Saldo akan otomatis terpotong ketika pesanan dikonfirmasi.

### 2. Alur Penjualan (Seller Flow)
1. **Kelola Produk**: *Seller* dapat menambah, merombak, dan mengatur stok produk via dashboard *seller*.
2. **Pesanan Masuk**: Setiap *checkout* dari *buyer* akan masuk ke daftar pesanan *seller*.
3. **Pemrosesan**: *Seller* memeriksa pesanan dan memilih **"Process Order"** untuk melanjutkan barang ke tahap pengiriman.

### 3. Alur Pengiriman (Driver Flow)
1. **Daftar Pekerjaan**: Pesanan yang telah diproses oleh *seller* akan otomatis muncul di *list job* pengiriman.
2. **Ambil Order**: *Driver* menerima/mengambil pesanan tersebut (*take job*).
3. **Selesai**: Setelah barang diserahkan ke *buyer*, *driver* mengubah status pekerjaannya menjadi selesai (*complete*). Status order *buyer* akan berubah menjadi selesai (Done/Completed).

---

## 🛠 Referensi Pengembang & API
- **API Documentation**: Panduan rute dan *endpoint* backend secara mendetail dapat diakses melalui antarmuka interaktif Scribe di: `http://localhost:8000/docs`.
- **Database Seeder**: Untuk me-*reset* data dan akun uji coba di atas, jalankan `php artisan migrate:fresh --seed` di direktori backend (lihat rujukan `SEEDER_GUIDE.md` untuk rincian).
