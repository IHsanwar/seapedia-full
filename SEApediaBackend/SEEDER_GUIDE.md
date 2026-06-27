# Database Seeding Guide

Panduan lengkap untuk menjalankan database seeder di SEApedia Backend.

## Daftar Akun Default

Semua akun menggunakan password: **`password`**

| Email | Role | Keterangan |
|-------|------|------------|
| `admin@seapedia.com` | Admin | Administrator sistem |
| `buyer@seapedia.com` | Buyer | Pembeli biasa |
| `seller@seapedia.com` | Seller, Buyer | Penjual + Pembeli |
| `driver@seapedia.com` | Driver, Buyer | Driver + Pembeli |
| `multi@seapedia.com` | Admin, Seller, Buyer, Driver | Semua role |

---

## Step-by-Step: Menjalankan Seeder

### Method 1: Fresh Start (Reset Database + Seed) **RECOMMENDED**

Gunakan ini untuk setup awal atau reset database ke kondisi awal.

```powershell
# 1. Masuk ke direktori backend
cd SEApediaBackend

# 2. Jalankan migrasi fresh dengan seeding
php artisan migrate:fresh --seed
```

**Apa yang terjadi:**
- Menghapus semua tabel
- Menjalankan ulang semua migrasi
- Menjalankan semua seeder

---

### Method 2: Seed Only (Tambah Data ke Database Existing)

Gunakan ini jika database sudah ada dan ingin menambah/mengupdate data.

```powershell
# 1. Masuk ke direktori backend
cd SEApediaBackend

# 2. Jalankan semua seeder
php artisan db:seed

# ATAU jalankan seeder spesifik
php artisan db:seed --class=UserAccountSeeder
php artisan db:seed --class=CategorySeeder
php artisan db:seed --class=ProductSeeder
php artisan db:seed --class=PromotionSeeder
```

---

### Method 3: Reset Database (Rollback + Re-migrate + Seed)

Gunakan ini jika ingin mereset database tanpa menghapus tabel (rollback migrasi terakhir).

```powershell
# 1. Masuk ke direktori backend
cd SEApediaBackend

# 2. Rollback semua migrasi lalu jalankan ulang dengan seed
php artisan migrate:refresh --seed
```

---

## Daftar Seeder yang Tersedia

| Seeder | Deskripsi | Dependencies |
|--------|-----------|--------------|
| `RoleSeeder` | Membuat roles (admin, seller, buyer, driver) | - |
| `UserAccountSeeder` | Membuat akun-akun default + wallet + store + driver profile | RoleSeeder |
| `CategorySeeder` | Membuat 17 kategori produk | - |
| `ProductSeeder` | Membuat 10 produk sample | UserAccountSeeder, CategorySeeder |
| `PromotionSeeder` | Membuat vouchers dan promos | - |

---

## Troubleshooting

### Error: "Class not found"

```powershell
# Jalankan composer dump-autoload untuk me-refresh autoloader
composer dump-autoload
```

### Error: "Foreign key constraint fails"

Pastikan menjalankan seeder dalam urutan yang benar:
1. `RoleSeeder` (harus pertama)
2. `UserAccountSeeder` (butuh Role)
3. `CategorySeeder`
4. `ProductSeeder` (butuh Store dari UserAccountSeeder dan Category)

### Error: "Table already exists"

Gunakan `migrate:fresh` alih-alih `migrate`:
```powershell
php artisan migrate:fresh --seed
```

---

## Perintah Checklist (Copy & Paste)

**Setup Awal (Fresh Install):**
```powershell
cd SEApediaBackend
php artisan migrate:fresh --seed
```

**Hanya Seeding (Database sudah ada):**
```powershell
cd SEApediaBackend
php artisan db:seed
```

**Seeder Spesifik:**
```powershell
cd SEApediaBackend
php artisan db:seed --class=UserAccountSeeder
```

---

## Summary Data yang Dibuat

Setelah menjalankan seeder, database akan berisi:

- **5 Users** dengan berbagai role combinations
- **2 Stores** (untuk seller accounts)
- **2 Driver Profiles** (untuk driver accounts)
- **5 Wallets** dengan saldo awal Rp 1.000.000
- **17 Categories** produk
- **10 Products** (5 dari masing-masing store)
- **3 Vouchers** (DISC50, DISC25K, WELCOME10)
- **3 Promos** (MEGA2026, FLASH50K, FREESHIP)
