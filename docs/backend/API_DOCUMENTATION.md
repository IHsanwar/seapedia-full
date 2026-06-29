# SEAPEDIA API Documentation

## Overview
The SEAPEDIA backend is fully API-based and follows RESTful conventions. It provides endpoints to support the end-to-end marketplace flow for Guests, Buyers, Sellers, Drivers, and Admins.

## API Documentation Access
The API is documented using Swagger/OpenAPI. Once the application is running, the documentation can be accessed via:
- **Swagger UI endpoint:** `http://localhost:8000/api/documentation` (or equivalent URL based on your server configuration)
- **OpenAPI JSON specification:** `http://localhost:8000/api/docs`

*(Alternatively, you can import the `postman_collection.json` located in the root directory into your Postman workspace if provided).*

## Core API Sections
The API is grouped logically by role and domain:

### 1. Public & Auth
- **`POST /api/auth/register`** - Register a new user.
- **`POST /api/auth/login`** - Login and receive an auth token.
- **`POST /api/auth/logout`** - Invalidate token.
- **`GET /api/products`** - List products (Guest accessible).
- **`POST /api/reviews`** - Submit public application review.

### 2. Buyer Endpoints
- **`GET /api/buyer/wallet`** - Get wallet balance and history.
- **`POST /api/buyer/wallet/topup`** - Simulate top-up.
- **`GET/POST/PUT/DELETE /api/buyer/cart`** - Manage single-store cart.
- **`POST /api/buyer/checkout`** - Checkout cart and create an order.
- **`GET /api/buyer/orders`** - Order history.

### 3. Seller Endpoints
- **`POST /api/seller/store`** - Create/update unique store profile.
- **`CRUD /api/seller/products`** - Manage store products.
- **`GET /api/seller/orders`** - View incoming orders.
- **`POST /api/seller/orders/{id}/process`** - Move order to `Menunggu Pengirim`.

### 4. Driver Endpoints
- **`GET /api/driver/jobs`** - Find available delivery jobs.
- **`POST /api/driver/jobs/{id}/take`** - Take a delivery job.
- **`POST /api/driver/jobs/{id}/complete`** - Mark job as completed.
- **`GET /api/driver/earnings`** - View job history and earnings.

### 5. Admin Endpoints
- **`GET /api/admin/monitoring/*`** - View stats for users, stores, orders, etc.
- **`CRUD /api/admin/vouchers`** - Manage vouchers and promos.
- **`POST /api/admin/simulate-time`** - Trigger overdue checks.

## Response Format
Standard JSON response format for success and errors (e.g., standard Laravel wrappers or JSend format).
Validation errors will return a `422` status code along with an `errors` object.
