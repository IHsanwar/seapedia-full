# 🌊 SEAPEDIA — Database Seeding Guide

Panduan lengkap untuk menjalankan database seeder di SEApedia Backend.

---

## 📋 Daftar Akun Demo

Semua akun menggunakan password: **`password`**

| Email | Role(s) | Keterangan |
|-------|---------|------------|
| `admin@seapedia.com` | Admin | Administrator sistem, akses ke semua monitoring |
| `buyer@seapedia.com` | Buyer | Pembeli murni dengan alamat dan wallet |
| `seller@seapedia.com` | Seller + Buyer | Penjual dengan toko + bisa berbelanja |
| `driver@seapedia.com` | Driver + Buyer | Driver dengan profil kendaraan + bisa berbelanja |
| `multi@seapedia.com` | Seller + Buyer + Driver | Akun multi-role untuk demo lengkap |

---

## 🛒 Data Promosi (Voucher & Promo)

### Voucher Codes
| Kode | Tipe | Nilai | Min. Pembelian | Maks. Diskon | Sisa Penggunaan |
|------|------|-------|----------------|--------------|-----------------|
| `DISC50` | Persen | 50% | Rp 50.000 | Rp 100.000 | 100 |
| `DISC25K` | Nominal | Rp 25.000 | Rp 100.000 | — | 50 |
| `WELCOME10` | Persen | 10% | Tanpa minimal | Rp 50.000 | 999 |

### Promo Codes
| Kode | Tipe | Nilai | Min. Pembelian | Maks. Diskon |
|------|------|-------|----------------|--------------|
| `MEGA2026` | Persen | 30% | Rp 200.000 | Rp 150.000 |
| `FLASH50K` | Nominal | Rp 50.000 | Rp 250.000 | — |
| `FREESHIP` | Nominal | Rp 20.000 | Rp 150.000 | — |

---

## 🏪 Toko & Produk Seeded

### Toko Seapedia 1 (seller@seapedia.com)
Produk seafood segar:
- Ikan Salmon Segar 500gr — Rp 85.000 (stok: 50)
- Udang Vaname Beku 1kg — Rp 95.000 (stok: 100)
- Cumi-Cumi Segar 500gr — Rp 45.000 (stok: 75)
- Kepiting Bakau 1 ekor — Rp 120.000 (stok: 30)
- Kerang Hijau Rebus 500gr — Rp 35.000 (stok: 80)

### Toko Serba Ada (multi@seapedia.com)
Produk serba ada:
- Kaos Polos Cotton 30s — Rp 75.000 (stok: 200)
- Sepatu Casual Sneakers Pria — Rp 250.000 (stok: 45)
- Tas Ransel Laptop 14 inch Anti Air — Rp 185.000 (stok: 60)
- Earphone Bluetooth 5.0 Wireless — Rp 149.000 (stok: 120)
- Minyak Zaitun Extra Virgin 500ml — Rp 110.000 (stok: 90)

---

## 🚀 Cara Menjalankan Seeder

### Method 1: Fresh Start (RECOMMENDED untuk setup awal)

Menghapus semua tabel dan menjalankan ulang migrasi + seed.

```powershell
cd SEApediaBackend
php artisan migrate:fresh --seed
```

### Method 2: Seed Only (Database sudah ada)

Menambahkan data tanpa mereset database.

```powershell
cd SEApediaBackend
php artisan db:seed
```

### Method 3: Seeder Spesifik

Jalankan seeder tertentu saja.

```powershell
cd SEApediaBackend

# Hanya role
php artisan db:seed --class=RoleSeeder

# Hanya akun user
php artisan db:seed --class=UserAccountSeeder

# Hanya kategori
php artisan db:seed --class=CategorySeeder

# Hanya produk (butuh UserAccountSeeder sudah berjalan)
php artisan db:seed --class=ProductSeeder

# Hanya alamat (butuh UserAccountSeeder sudah berjalan)
php artisan db:seed --class=AddressSeeder

# Hanya voucher & promo
php artisan db:seed --class=PromotionSeeder

# Hanya review publik
php artisan db:seed --class=ReviewSeeder
```

### Method 4: Refresh (Rollback + Re-migrate + Seed)

```powershell
cd SEApediaBackend
php artisan migrate:refresh --seed
```

---

## 📦 Daftar Seeder Lengkap

| Seeder | Deskripsi | Dependencies |
|--------|-----------|--------------|
| `RoleSeeder` | 4 roles: admin, seller, buyer, driver | — |
| `UserAccountSeeder` | 5 akun demo + wallet + store + driver profile | `RoleSeeder` |
| `CategorySeeder` | 17 kategori produk | — |
| `ProductSeeder` | 10 produk sample (5 per toko) | `UserAccountSeeder` |
| `AddressSeeder` | Alamat pengiriman untuk semua buyer account | `UserAccountSeeder` |
| `PromotionSeeder` | 3 voucher + 3 promo | — |
| `ReviewSeeder` | 10 ulasan publik aplikasi (campuran guest & user) | `UserAccountSeeder` |

**Urutan Eksekusi (DatabaseSeeder):**
```
RoleSeeder → UserAccountSeeder → CategorySeeder → ProductSeeder
           → AddressSeeder → PromotionSeeder → ReviewSeeder
```

---

## 💡 Catatan Penting

### Idempotency
Semua seeder menggunakan `firstOrCreate()` atau pengecekan exist sehingga **aman dijalankan berkali-kali** tanpa membuat duplikat.

### Wallet Awal
Semua akun buyer mendapatkan saldo wallet awal **Rp 1.000.000** untuk demo checkout.

### Alamat Default
Setiap akun buyer memiliki minimal 1 alamat default yang siap digunakan saat checkout.

### Peran Driver
Akun `driver@seapedia.com` dan `multi@seapedia.com` memiliki profil driver dengan data kendaraan, siap mengambil delivery job.

---

## 🔧 Troubleshooting

### Error: "Class not found"
```powershell
composer dump-autoload
```

### Error: "Foreign key constraint fails"
Pastikan menjalankan seeder dalam urutan yang benar (RoleSeeder harus pertama).

### Error: "Table already exists"
Gunakan `migrate:fresh` untuk reset penuh:
```powershell
php artisan migrate:fresh --seed
```

### Error: "Duplicate entry for key 'vouchers.code'"
Seeder sudah menggunakan `firstOrCreate`, pastikan tidak menjalankan `Voucher::create()` manual secara terpisah.

---

## 🎯 Quick Start Checklist

```powershell
# 1. Setup environment
cd SEApediaBackend
cp .env.example .env
php artisan key:generate

# 2. Konfigurasi database di .env (DB_DATABASE, DB_USERNAME, DB_PASSWORD)

# 3. Jalankan migrasi dan seeder
php artisan migrate:fresh --seed

# 4. Jalankan server
php artisan serve

# 5. Test API
# Login: POST /api/v1/auth/login
# Body: { "login": "buyer@seapedia.com", "password": "password" }
```

---

## 📊 Ringkasan Data Setelah Seeding

| Entitas | Jumlah |
|---------|--------|
| Users | 5 |
| Roles | 4 (admin, seller, buyer, driver) |
| Stores | 2 |
| Driver Profiles | 2 |
| Wallets | 5 (saldo Rp 1.000.000 masing-masing) |
| Categories | 17 |
| Products | 10 (5 per toko) |
| Addresses | 6 (1-2 per buyer) |
| Vouchers | 3 |
| Promos | 3 |
| Reviews | 10 (8 guest + 2 user) |
