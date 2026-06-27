# Level 6: Admin Monitoring and Overdue Handling — Implementation Plan

## Ringkasan

Level 6 bertujuan memberikan Admin visibilitas penuh atas marketplace dan kemampuan menangani order yang melewati SLA (overdue). Implementasi dibagi menjadi 3 bagian utama:

1. **Admin Monitoring Dashboard** (3 pts) — statistik dan monitoring seluruh entitas
2. **Voucher & Promo Management UI** (2 pts) — UI admin untuk CRUD voucher & promo
3. **Overdue Auto Return / Refund** (5 pts) — mekanisme pengembalian otomatis + simulasi hari

---

## Status Requirement Level 6

### ✅ Sudah Terpenuhi

| Requirement | Status | Catatan |
|---|---|---|
| Admin endpoint CRUD Voucher | ✅ Done | `VoucherController` di `Promotion/` |
| Admin endpoint CRUD Promo | ✅ Done | `PromoController` di `Promotion/` |
| Admin User management (list, create, update, delete) | ✅ Done | `Admin/UserController` |
| Admin route group dengan middleware `role:admin` | ✅ Done | `routes/api/admin.php` |
| Frontend VoucherManagementPage | ✅ Done (partial) | Sudah ada tapi perlu styling & integrasi |
| Model: Order, Delivery, Driver, Wallet, WalletTransaction | ✅ Done | Siap dipakai |
| Status order lifecycle lengkap | ✅ Done | Sedang Dikemas → Menunggu Pengirim → Sedang Dikirim → Pesanan Selesai |

### ❌ Belum Terpenuhi

| Requirement | Status | Prioritas |
|---|---|---|
| **Admin Dashboard** — statistik marketplace (users, stores, orders, dll) | ❌ Missing | 🔴 Tinggi |
| **Admin Monitoring: Users** — list user dengan filter role | ❌ Partial | 🔴 Tinggi |
| **Admin Monitoring: Sellers/Stores** | ❌ Missing | 🔴 Tinggi |
| **Admin Monitoring: Orders** — semua order dengan status | ❌ Missing | 🔴 Tinggi |
| **Admin Monitoring: Delivery Jobs** | ❌ Missing | 🔴 Tinggi |
| **Admin Monitoring: Overdue Orders** | ❌ Missing | 🔴 Tinggi |
| **Admin Monitoring: Products** | ❌ Missing | 🟡 Sedang |
| **Admin Promo Management UI** | ❌ Missing | 🟡 Sedang |
| **Admin Voucher Management UI improvement** | ❌ Partial | 🟡 Sedang |
| **Overdue SLA definition** | ❌ Missing | 🔴 Tinggi |
| **Overdue auto refund logic** | ❌ Missing | 🔴 Tinggi |
| **Wallet refund untuk overdue** | ❌ Missing | 🔴 Tinggi |
| **Stock restoration untuk overdue** | ❌ Missing | 🔴 Tinggi |
| **Seller income reversal untuk overdue** | ❌ Missing | 🔴 Tinggi |
| **Admin trigger untuk overdue handling** | ❌ Missing | 🔴 Tinggi |
| **Simulate next day (time simulation)** | ❌ Missing | 🔴 Tinggi |
| **Frontend Admin Dashboard page** | ❌ Missing | 🔴 Tinggi |
| **Frontend Admin Promo Management** | ❌ Missing | 🟡 Sedang |
| **Frontend Overdue order display** | ❌ Missing | 🔴 Tinggi |
| **Dokumentasi di /docs** | ❌ Missing | 🟡 Sedang |

---

## Open Questions

> [!IMPORTANT]
> **Seller Income Tracking**: Apakah seller income disimpan di wallet atau hanya di order? Perlu dicek apakah ada `wallet_transactions` bertipe `seller_income` saat order selesai. Jika tidak, reversal akan lebih sederhana (cukup flag di order).

> [!IMPORTANT]
> **SLA Overdue**: Apakah "overdue" dihitung dari `created_at` order atau dari `taken_at` delivery? Rencana: dihitung dari saat delivery dibuat (order status menjadi Menunggu Pengirim).

> [!NOTE]
> **Promo Management**: Saat ini `PromoController` sudah ada di backend tapi belum ada halaman frontend khusus admin untuk promo.

---

## SLA Overdue Rules (Rencana)

| Delivery Method | SLA (Jam) | Overdue After |
|---|---|---|
| Instant | 3 jam | 3 jam setelah delivery dibuat |
| Next Day | 28 jam | 28 jam setelah delivery dibuat |
| Regular | 72 jam | 72 jam setelah delivery dibuat |

Overdue hanya berlaku untuk order dengan status `Sedang Dikirim` atau `Menunggu Pengirim`.

---

## Endpoint yang Perlu Dibuat (Backend)

### Admin Dashboard & Statistics
```
GET /api/v1/admin/dashboard          — summary stats (total users, orders, revenue, dll)
GET /api/v1/admin/stats/users        — user statistics by role
GET /api/v1/admin/stats/orders       — order statistics by status
GET /api/v1/admin/stats/deliveries   — delivery statistics
```

### Admin Monitoring
```
GET /api/v1/admin/stores             — list semua store
GET /api/v1/admin/stores/{id}        — detail store
GET /api/v1/admin/products           — list semua produk
GET /api/v1/admin/orders             — list semua order (dengan filter status)
GET /api/v1/admin/orders/{id}        — detail order
GET /api/v1/admin/deliveries         — list semua delivery job
GET /api/v1/admin/deliveries/{id}    — detail delivery
GET /api/v1/admin/overdue-orders     — list order yang overdue
```

### Overdue Handling
```
POST /api/v1/admin/overdue/process          — trigger manual: proses semua overdue orders
POST /api/v1/admin/overdue/{order}/refund   — manual refund satu order overdue
POST /api/v1/admin/simulate-next-day        — simulasi waktu maju 1 hari (untuk demo)
```

### Voucher & Promo (sudah ada, tidak perlu tambah)
Sudah ada di `/api/v1/admin/vouchers` dan `/api/v1/admin/promos`.

---

## Controller yang Perlu Dibuat

### Backend
| Controller | Namespace | Keterangan |
|---|---|---|
| `DashboardController` | `Admin\` | Summary stats & marketplace overview |
| `MonitorController` | `Admin\` | Monitoring stores, orders, deliveries, products |
| `OverdueController` | `Admin\` | Overdue processing, refund, time simulation |

### Artisan Command
| Command | Keterangan |
|---|---|
| `app:process-overdue-orders` | Proses semua order overdue (bisa dijadwalkan/trigger manual) |

---

## Resources yang Diperlukan

| Resource | Keterangan |
|---|---|
| `DeliveryResource` (baru) | Untuk monitoring delivery jobs |
| `StoreResource` | Sudah ada, perlu cek kelengkapan |
| `ProductResource` | Sudah ada |
| `OrderResource` | Sudah ada, mungkin perlu field tambahan |

---

## Request Validation yang Diperlukan

Overdue handling tidak banyak butuh form input. Yang diperlukan:
- `POST /simulate-next-day` — opsional: `{ days: 1 }` (berapa hari yang disimulasikan)

---

## Migration Baru

> [!NOTE]
> **Tidak ada migration baru yang diperlukan.** Semua data tersedia di tabel yang sudah ada. Kolom `status` di `orders` sudah mendukung `Dikembalikan`. Kolom `taken_at` dan `completed_at` di `deliveries` cukup untuk SLA calculation.

---

## Dampak terhadap Frontend

- Tambah halaman `/admin/dashboard` (Admin Monitoring Dashboard)
- Tambah halaman `/admin/orders` (Admin Monitor Orders)
- Tambah halaman `/admin/stores` (Admin Monitor Stores)
- Tambah halaman `/admin/deliveries` (Admin Monitor Deliveries)
- Tambah halaman `/admin/overdue` (Admin Overdue Orders)
- Tambah halaman `/admin/promos` (Admin Promo Management)
- Update route `index.jsx` untuk menambahkan semua route admin baru
- Tambah API module `admin.js` untuk semua call ke admin endpoints
- **Tidak mengubah** API yang sudah dipakai buyer/seller/driver

---

## Urutan Implementasi (Aman, Minim Refactor)

### Tahap 1 — Backend: Admin Dashboard & Monitoring Endpoints
1. Buat `Admin\DashboardController` dengan endpoint `/dashboard`
2. Buat `Admin\MonitorController` untuk stores, products, orders, deliveries
3. Update `routes/api/admin.php` dengan endpoint baru
4. Buat `DeliveryResource` untuk monitoring delivery

### Tahap 2 — Backend: Overdue Handling
1. Buat Artisan command `ProcessOverdueOrders`
2. Buat `Admin\OverdueController` dengan endpoint process, refund, dan simulate-next-day
3. Logic: cek SLA → update status ke `Dikembalikan` → refund wallet → restore stock → catat history
4. Double-refund prevention via status check

### Tahap 3 — Frontend: Admin Dashboard Page
1. Buat `AdminDashboardPage.jsx` dengan summary cards dan statistik
2. Buat `AdminOrdersPage.jsx` untuk monitoring order
3. Buat `AdminStoresPage.jsx` untuk monitoring stores
4. Buat `AdminDeliveriesPage.jsx` untuk monitoring delivery
5. Buat `AdminOverduePage.jsx` untuk overdue orders + trigger button
6. Buat `PromoManagementPage.jsx` (admin)
7. Update route `index.jsx`
8. Buat API module `admin.js`

### Tahap 4 — Dokumentasi
1. Buat `docs/level-6-admin.md` — dokumentasi fitur Level 6
2. Update API docs (Scribe) dengan endpoint baru

---

## Verification Plan

### Automated
- Jalankan `php artisan route:list` untuk verifikasi endpoint terdaftar
- Jalankan `php artisan scribe:generate` untuk update API docs

### Manual
1. Login sebagai admin → akses `/admin/dashboard` → lihat summary stats
2. Cek monitoring pages: users, stores, orders, delivery, overdue
3. Buat voucher baru → lihat di list → update → hapus
4. Buat promo baru → lihat di list → update → hapus
5. Demo overdue: buat order → driver ambil job → trigger simulate next day → verifikasi status berubah ke `Dikembalikan` → verifikasi wallet refund → verifikasi stock restored

---

## Catatan Penting

> [!WARNING]
> Jangan ubah struktur API yang sudah dipakai buyer, seller, dan driver. Semua endpoint baru hanya di prefix `/api/v1/admin/`.

> [!CAUTION]
> Double-refund protection wajib: sebelum refund, cek apakah order sudah pernah direfund (`status === 'Dikembalikan'`).

> [!TIP]
> Untuk simulasi waktu, gunakan parameter `hours` atau `days` yang mengurangi SLA threshold, bukan mengubah system time. Ini lebih aman dan tidak berisiko side effect.
