# Analisis Relationship Driver dan Delivery - SEApedia Backend

## Struktur Database

### 1. Tabel `drivers`
- **ID**: Primary key (auto-increment)
- **user_id**: Foreign key ke `users.id` (cascade on delete)
- **name**: Nama driver
- **phone_number**: Nomor telepon driver
- **vehicle_type**: Jenis kendaraan
- **vehicle_plate_number**: Plat nomor kendaraan
- **is_active**: Status aktif driver (default: true)
- **timestamps**: created_at, updated_at

### 2. Tabel `deliveries`
- **ID**: Primary key (auto-increment)
- **order_id**: Foreign key ke `orders.id` (cascade on delete)
- **driver_id**: Foreign key ke `users.id` (nullable, null on delete)
- **method**: Enum ('instant', 'next_day', 'regular')
- **fee**: Biaya pengiriman (decimal 15,2)
- **status**: Status pengiriman (string, default: 'waiting_driver')
- **taken_at**: Timestamp ketika driver mengambil job (nullable)
- **completed_at**: Timestamp ketika pengiriman selesai (nullable)
- **timestamps**: created_at, updated_at

### 3. Tabel `users`
- **ID**: Primary key (auto-increment)
- **name**: Nama user
- **username**: Username (unique)
- **email**: Email (unique)
- **phone**: Nomor telepon (nullable)
- **avatar_url**: URL avatar (nullable)
- **email_verified_at**: Timestamp verifikasi email (nullable)
- **password**: Password (hashed)
- **remember_token**: Token remember me
- **timestamps**: created_at, updated_at

## Relationship Analysis

### Driver Model Relationships
```php
// Driver has many Orders
public function orders()
{
    return $this->hasMany(Order::class);
}

// Driver has many Deliveries
public function deliveries()
{
    return $this->hasMany(Delivery::class, 'driver_id');
}

// Driver completed deliveries
public function completedDeliveries()
{
    return $this->deliveries()->where('status', 'completed');
}

// Driver active deliveries
public function activeDeliveries()
{
    return $this->deliveries()->where('status', 'in_progress');
}
```

### Delivery Model Relationships
```php
// Delivery belongs to Order
public function order()
{
    return $this->belongsTo(Order::class);
}

// Delivery belongs to User (Driver)
public function driver()
{
    return $this->belongsTo(User::class, 'driver_id');
}
```

## Relationship Flow

```
users (id) ← drivers (user_id) → deliveries (driver_id)
```

**Important Note**: 
- `drivers.user_id` → `users.id` (User memiliki record driver)
- `deliveries.driver_id` → `users.id` (Delivery diassign ke user yang adalah driver)
- Untuk mendapatkan driver record dari delivery: `delivery.driver_id → users.id → drivers.user_id`

## Status Values yang Valid

### Delivery Status
- `waiting_driver`: Menunggu driver mengambil job
- `in_progress`: Driver sedang mengantar
- `completed`: Pengiriman selesai

## Cara Menjalankan Analisis

### Option 1: Menggunakan Artisan Command (Recommended)

1. Pastikan command sudah terdaftar di `app/Console/Kernel.php`:
```php
protected $commands = [
    Commands\AnalyzeDriverDelivery::class,
];
```

2. Jalankan command:
```bash
cd SEApediaBackend
php artisan analyze:driver-delivery
```

### Option 2: Menggunakan SQL Query

1. Buka file `analyze_driver_delivery.sql`
2. Jalankan query di database tool (phpMyAdmin, MySQL Workbench, DBeaver, dll)
3. Atau gunakan tinker:
```bash
cd SEApediaBackend
php artisan tinker
```

Lalu jalankan query menggunakan:
```php
DB::select('SELECT * FROM drivers');
DB::select('SELECT * FROM deliveries');
// dll
```

### Option 3: Menggunakan Database Connection Info

**Database Configuration:**
- Host: 127.0.0.1
- Port: 3306
- Database: seapedia
- Username: root
- Password: (empty)

## Yang Perlu Dicek

### 1. Driver Record untuk User yang Login
```sql
SELECT d.*, u.username, u.email
FROM drivers d
JOIN users u ON d.user_id = u.id
WHERE u.id = [USER_ID_LOGIN];
```

### 2. Delivery Records dengan Driver_ID yang Sesuai
```sql
SELECT d.*, u.username, dr.name as driver_name
FROM deliveries d
JOIN users u ON d.driver_id = u.id
JOIN drivers dr ON u.id = dr.user_id
WHERE u.id = [USER_ID_LOGIN];
```

### 3. Delivery Records dengan Status yang Benar
```sql
-- In Progress
SELECT * FROM deliveries 
WHERE driver_id = [USER_ID_LOGIN] 
AND status = 'in_progress';

-- Completed
SELECT * FROM deliveries 
WHERE driver_id = [USER_ID_LOGIN] 
AND status = 'completed';
```

### 4. Foreign Key Relationship Issues
```sql
-- Deliveries dengan driver_id tapi tidak ada di drivers table
SELECT d.*
FROM deliveries d
LEFT JOINED users u ON d.driver_id = u.id
LEFT JOIN drivers dr ON u.id = dr.user_id
WHERE d.driver_id IS NOT NULL 
AND dr.id IS NULL;
```

## Potential Issues yang Bisa Terjadi

1. **Driverless Deliveries**: Delivery punya driver_id tapi tidak ada record di drivers table
2. **Missing Timestamps**: 
   - In_progress delivery tanpa taken_at
   - Completed delivery tanpa completed_at
3. **Orphaned Records**: Drivers tanpa user, atau deliveries tanpa order

## Rekomendasi

1. Pastikan setiap user yang menjadi driver punya record di tabel drivers
2. Pastikan delivery yang diassign ke driver punya driver_id yang valid
3. Pastikan status dan timestamp konsisten:
   - status = 'in_progress' → taken_at harus ada
   - status = 'completed' → taken_at dan completed_at harus ada
4. Gunakan transaction saat mengubah status delivery untuk mencegah inkonsistensi

## Files yang Dibuat

1. `analyze_driver_delivery.sql` - SQL queries untuk analisis manual
2. `app/Console/Commands/AnalyzeDriverDelivery.php` - Artisan command untuk analisis otomatis
3. `DRIVER_DELIVERY_ANALYSIS.md` - Dokumentasi ini