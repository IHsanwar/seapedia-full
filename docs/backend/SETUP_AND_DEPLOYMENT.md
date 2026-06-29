# SEAPEDIA Backend Setup & Deployment

## Requirements
- PHP 8.1+
- Composer
- MySQL or PostgreSQL
- Node.js (for frontend/Vite, if integrated)

## Installation Steps
1. Clone the repository and navigate to the backend folder (`SEApediaBackend`).
2. Run `composer install` to install PHP dependencies.
3. Copy `.env.example` to `.env` and configure your database settings:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=128.0.0.1
   DB_PORT=3306
   DB_DATABASE=seapedia
   DB_USERNAME=root
   DB_PASSWORD=
   ```
4. Run `php artisan key:generate` to generate the application key.
5. Run migrations and seeders to initialize the database with demo data:
   ```bash
   php artisan migrate:fresh --seed
   ```
6. Start the local development server:
   ```bash
   php artisan serve
   ```
   The backend API will be accessible at `http://localhost:8000`.

## Admin Account Setup
The Admin account is automatically created when running the database seeders. By default, the admin credentials are:
- **Email:** `admin@seapedia.com`
- **Password:** `password`
- **Role:** Admin

*(Check `DatabaseSeeder.php` for specific predefined demo accounts for Sellers, Buyers, and Drivers).*

## Simulating Time (Overdue Handling)
To simulate the next day and trigger the overdue order checker (returning/refunding orders that have exceeded SLA):
- Use the provided Admin endpoint: `POST /api/admin/simulate-time`
- OR run the Artisan command manually: `php artisan app:check-overdue-orders`
