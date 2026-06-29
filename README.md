
# Overview

SEAPEDIA is a modern marketplace platform that simulates a complete e-commerce ecosystem for marine products and services.
# CHECK /DOCS FOR MORE DOCUMENTATION INFORMATION
Unlike a traditional online store, SEAPEDIA supports multiple actors within one integrated system:

-  Buyer
-  Seller
-  Driver
-  Admin

The platform implements a complete transaction lifecycle—from product browsing, shopping cart, checkout, seller processing, delivery assignment, until administrative monitoring and overdue handling.

---
# Live Demo

## Frontend
Deployed with vercel
https://seapedia.ihsanwardhana.web.id/

## Backend API
https://seapedia.ciphera.my.id/

---

#  Features

##  Buyer

- User Authentication
- Multi Role Switching
- Wallet System
- Address Management
- Product Catalogue
- Shopping Cart
- Checkout
- Voucher System
- Promotion System
- Order History
- Spending Report

---

##  Seller

- Store Management
- Product CRUD
- Product Categories
- Incoming Orders
- Process Orders
- Sales Report

---

##  Driver

- Driver Registration
- Available Delivery Jobs
- Accept Delivery
- Complete Delivery
- Delivery Earnings

---

##  Admin

- Marketplace Dashboard
- User Monitoring
- Store Monitoring
- Product Monitoring
- Order Monitoring
- Delivery Monitoring
- Voucher Management
- Promotion Management
- Overdue Order Processing
- Marketplace Statistics

---

#  Technology Stack

## Backend

- Laravel 13
- Laravel Sanctum
- MySQL
- Scribe API Documentation

## Frontend

- React
- Vite
- TailwindCSS v4
- shadcn/ui
- Lucide React
- React Router

## Deployment

- Backend Server
- Frontend on Vercel

---

# Marketplace Workflow

```text
Buyer

Browse Products
      │
      ▼
 Add to Cart
      │
      ▼
 Checkout
      │
      ▼
Seller Processes Order
      │
      ▼
Waiting Driver
      │
      ▼
Driver Accepts Job
      │
      ▼
Delivery
      │
      ▼
Order Completed
```

---

# Multi Role System

A single account can own multiple roles.

| Role | Description |
|------|-------------|
| Buyer | Purchase products |
| Seller | Manage store & products |
| Driver | Deliver orders |
| Admin | Marketplace monitoring |

Roles are switched securely using Laravel Sanctum Token Abilities.

---

# Project Structure

```
SEAPEDIA
│
├── backend
│   ├── app
│   ├── database
│   ├── routes
│   └── ...
│
├── frontend
│   ├── src
│   ├── public
│   └── ...
│
└── docs
```

---

# Live Demo

## Frontend

https://seapedia.ihsanwardhana.web.id/

## Backend API

https://seapedia.ciphera.my.id/

## API Documentation

https://seapedia.ciphera.my.id/docs

## Video Demonstration

https://seapedia.ihsanwardhana.web.id/video-demo

---

# ⚙️ Local Installation

## Clone Repository

```bash
git clone <repository-url>
```

---

## Backend

```bash
cd backend

composer install

cp .env.example .env

php artisan key:generate

php artisan migrate --seed

php artisan serve
```

### Admin Account & Seed Data
Running the seed command automatically generates demo accounts, including the **Admin** account:
- **Email:** `admin@seapedia.com`
- **Password:** `password`
- **Role:** Admin

For a complete list of demo accounts for Sellers, Buyers, and Drivers, please refer to the `docs/SEEDER_GUIDE.md` or check `DatabaseSeeder.php`.

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# API Documentation

The backend provides a fully documented REST API generated using **Laravel Scribe**.

Documentation:

https://seapedia.ciphera.my.id/docs

---

---

#  Documentation

Additional technical documentation is available inside the repository:

- Security Documentation
- Architecture Documentation
- API Documentation
- Testing Documentation
- Product Design Documentation

---

#  Challenge Coverage

This project implements all major challenge levels including:

- Authentication
- Multi Role System
- Wallet
- Address Management
- Store Management
- Product Management
- Shopping Cart
- Checkout
- Voucher
- Promotion
- Seller Processing
- Delivery System
- Driver Module
- Admin Dashboard
- Overdue Handling
- Security Hardening
- API Documentation
- Frontend Implementation

---

<div align="center">

**SEAPEDIA**

</div>
