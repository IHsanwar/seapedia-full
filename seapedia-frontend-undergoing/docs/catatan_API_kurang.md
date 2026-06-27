# Catatan API yang Belum Diimplementasikan

Dokumen ini berisi daftar dummy data yang digunakan dalam frontend dan API endpoints yang perlu diimplementasikan di backend.

---

## 📊 Daftar Dummy Data

### 1. Flash Sale / Produk Diskon

**File**: `src/pages/HomePage.jsx`

**Variabel**: `flashSaleProducts`

**Purpose**: Menampilkan produk dengan diskon di section Flash Sale

**Struktur Data**:
```javascript
[
  {
    id: 1,
    name: "Laptop Gaming ASUS ROG",
    originalPrice: 15000000,
    salePrice: 12000000,
    discount: 20,
    image: "https://via.placeholder.com/300x300?text=Laptop",
    rating: 4.8,
    sold: 120
  }
]
```

---

### 2. Featured Products

**File**: `src/pages/HomePage.jsx`

**Variabel**: `featuredProducts`

**Purpose**: Menampilkan produk unggulan di grid produk

**Struktur Data**:
```javascript
[
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    price: 18500000,
    originalPrice: 20000000,
    image: "https://via.placeholder.com/300x400?text=iPhone",
    rating: 4.9,
    reviews: 250,
    store: "Apple Store Official",
    location: "Jakarta"
  }
]
```

---

### 3. Categories Data

**File**: `src/pages/HomePage.jsx`

**Variabel**: `categories`

**Purpose**: Menampilkan kategori produk dalam carousel

**Struktur Data**:
```javascript
[
  { id: 1, name: "Elektronik", icon: "Smartphone", color: "bg-blue-500", count: 1240 },
  { id: 2, name: "Fashion", icon: "Shirt", color: "bg-pink-500", count: 3500 },
  { id: 3, name: "Makanan", icon: "Utensils", color: "bg-orange-500", count: 890 },
  { id: 4, name: "Kesehatan", icon: "Heart", color: "bg-red-500", count: 450 },
  { id: 5, name: "Otomotif", icon: "Car", color: "bg-purple-500", count: 320 },
  { id: 6, name: "Olahraga", icon: "Dumbbell", color: "bg-green-500", count: 670 },
  { id: 7, name: "Rumah Tangga", icon: "Home", color: "bg-teal-500", count: 980 },
  { id: 8, name: "Buku", icon: "Book", color: "bg-indigo-500", count: 450 },
  { id: 9, name: "Mainan", icon: "Gamepad2", color: "bg-yellow-500", count: 560 },
  { id: 10, name: "Kecantikan", icon: "Sparkles", color: "bg-rose-500", count: 780 }
]
```

---

### 4. Testimonials Data

**File**: `src/pages/HomePage.jsx`

**Variabel**: `testimonials`

**Purpose**: Menampilkan testimonial pelanggan

**Struktur Data**:
```javascript
[
  {
    id: 1,
    name: "Budi Santoso",
    avatar: "https://via.placeholder.com/60x60?text=BS",
    rating: 5,
    review: "SEAPEDIA sangat memudahkan saya dalam berbelanja online. Pengiriman cepat dan produk berkualitas!",
    date: "2024-01-15",
    role: "Buyer"
  }
]
```

---

## 🌐 API Endpoints yang Perlu Diimplementasikan

### 1. **Flash Sale API**

**Current**: Data dummy di frontend

**Suggested API**: `GET /api/flash-sale`

**Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Laptop Gaming ASUS ROG",
      "original_price": 15000000,
      "sale_price": 12000000,
      "discount": 20,
      "image": "https://storage.seapedia.com/products/1.jpg",
      "rating": 4.8,
      "sold": 120,
      "end_time": "2024-01-31T23:59:59"
    }
  ],
  "meta": {
    "total": 10,
    "per_page": 10
  }
}
```

---

### 2. **Featured Products API**

**Current**: Data dummy di frontend

**Suggested API**: `GET /api/products/featured`

**Query Parameters**:
- `limit` (integer, optional): Jumlah produk (default: 8)
- `category` (string, optional): Filter kategori

**Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "iPhone 15 Pro Max",
      "slug": "iphone-15-pro-max",
      "price": 18500000,
      "original_price": 20000000,
      "image": "https://storage.seapedia.com/products/iphone15.jpg",
      "rating": 4.9,
      "reviews_count": 250,
      "store": {
        "id": 1,
        "name": "Apple Store Official",
        "location": "Jakarta"
      },
      "is_wishlist": false
    }
  ]
}
```

---

### 3. **Categories API**

**Current**: Data dummy di frontend

**Suggested API**: `GET /api/categories`

**Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Elektronik",
      "slug": "elektronik",
      "icon": "Smartphone",
      "color": "#3b82f6",
      "product_count": 1240,
      "image": "https://storage.seapedia.com/categories/elektronik.jpg"
    }
  ]
}
```

---

### 4. **Testimonials API**

**Current**: Data dummy di frontend

**Suggested API**: `GET /api/testimonials`

**Query Parameters**:
- `limit` (integer, optional): Jumlah testimonial (default: 6)

**Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user": {
        "id": 1,
        "name": "Budi Santoso",
        "avatar": "https://storage.seapedia.com/avatars/user1.jpg"
      },
      "rating": 5,
      "review": "SEAPEDIA sangat memudahkan saya dalam berbelanja online. Pengiriman cepat dan produk berkualitas!",
      "created_at": "2024-01-15T10:00:00",
      "role": "Buyer"
    }
  ]
}
```

---

## 📝 API Endpoints Lain yang Sudah Ada (Untuk Referensi)

| Endpoint | Method | Status | Keterangan |
|----------|--------|--------|------------|
| `/api/auth/login` | POST | ✅ Implemented | Login dengan email/username |
| `/api/auth/register` | POST | ✅ Implemented | Registrasi user baru |
| `/api/auth/logout` | POST | ✅ Implemented | Logout user |
| `/api/auth/me` | GET | ✅ Implemented | Get current user |
| `/api/auth/refresh` | POST | ✅ Implemented | Refresh token |
| `/api/products` | GET | ✅ Implemented | List semua produk |
| `/api/products/{id}` | GET | ✅ Implemented | Detail produk |
| `/api/cart` | GET/POST | ✅ Implemented | Keranjang belanja |
| `/api/orders` | GET/POST | ✅ Implemented | Pesanan |
| `/api/wallet` | GET | ✅ Implemented | Wallet user |
| `/api/reviews` | GET/POST | ✅ Implemented | Ulasan aplikasi |

---

## 🎯 Summary Implementasi

### High Priority (Homepage)
1. `GET /api/flash-sale` - Untuk section Flash Sale
2. `GET /api/products/featured` - Untuk Featured Products
3. `GET /api/categories` - Untuk Categories Carousel
4. `GET /api/testimonials` - Untuk Testimonials Section

### Medium Priority
5. Search API dengan filters
6. Product recommendations API
7. Recently viewed products API

### Notes
- Semua API harus mendukung pagination
- Response harus konsisten dengan format `{"success": boolean, "data": ..., "meta": ...}`
- Authentication menggunakan Bearer token via header `Authorization`

---

*Generated for Seapedia Project - Frontend Documentation*
