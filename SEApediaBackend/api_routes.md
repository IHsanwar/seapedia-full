# SEApedia API Routes Documentation

This document outlines the API endpoints that have been implemented in the SEApedia backend system.

## 1. Authentication Endpoints
These endpoints manage user registration, authentication, and active role switching.

| Method | Endpoint | Description | Middleware |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Mendaftarkan pengguna baru dengan default role 'buyer'. | `api` |
| `POST` | `/api/v1/auth/login` | Melakukan proses login dan menerbitkan Bearer Token Sanctum. | `api` |
| `GET` | `/api/v1/auth/me` | Mengambil data profil user yang sedang login. | `auth:sanctum` |
| `POST` | `/api/v1/auth/switch-role` | Menukar role aktif user pada sesi ini. Token lama di-_revoke_ dan token baru diterbitkan. | `auth:sanctum` |
| `POST` | `/api/v1/auth/logout` | Mencabut/menonaktifkan Bearer Token sesi saat ini. | `auth:sanctum` |

## 2. Admin User Management Endpoints
Endpoints berikut hanya bisa diakses oleh pengguna dengan role `admin`.

| Method | Endpoint | Description | Middleware |
|---|---|---|---|
| `GET` | `/api/v1/admin/users` | Menampilkan seluruh daftar user secara _paginated_. | `auth:sanctum`, `role:admin` |
| `POST` | `/api/v1/admin/users` | Admin menambahkan data user baru. | `auth:sanctum`, `role:admin` |
| `GET` | `/api/v1/admin/users/{user}` | Mengambil detail satu spesifik user berdasarkan ID. | `auth:sanctum`, `role:admin` |
| `PUT/PATCH`| `/api/v1/admin/users/{user}` | Admin memperbarui data spesifik user. | `auth:sanctum`, `role:admin` |
| `DELETE` | `/api/v1/admin/users/{user}` | Admin menghapus data spesifik user. | `auth:sanctum`, `role:admin` |

## 3. Profile & Dashboard
Endpoint ini menyediakan ringkasan profil multi-role bagi pengguna terautentikasi.

| Method | Endpoint | Description | Middleware |
|---|---|---|---|
| `GET` | `/api/profile/dashboard` | Menampilkan seluruh role yang dimiliki, role yang saat ini aktif (_active role_), beserta ringkasan finansial/saldo multi-role. | `auth:sanctum` |

## 4. API Documentation
Dokumentasi interaktif bawaan dari Scribe.

| Method | Endpoint | Description | Middleware |
|---|---|---|---|
| `GET` | `/docs` | Halaman interaktif dokumentasi API (Scribe). | `web` |
| `GET` | `/docs.openapi`| Halaman spesifikasi OpenAPI / Swagger JSON endpoint. | `web` |

---
**Catatan Penting Mekanisme Role:**
1. Semua _private endpoints_ (kecuali `/auth/switch-role` dan `/profile/dashboard`) memerlukan pengecekan active role pada token ability.
2. Jika pengguna memiliki banyak role dan baru saja login, mereka akan mendapatkan token "netral" dengan ability `['role:none']`, yang mengharuskan pemanggilan `/auth/switch-role` sebelum bisa menggunakan API role-spesifik.
