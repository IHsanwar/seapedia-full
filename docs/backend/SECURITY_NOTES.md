# Backend Security Notes

This document outlines the security measures implemented in the SEAPEDIA backend system to ensure data integrity and user safety, as required by Level 7.

## 1. SQL Injection Prevention
- The backend utilizes Laravel's Eloquent ORM and Query Builder for all database interactions.
- All incoming requests use parameterized queries inherently through Eloquent models.
- Direct database raw queries (`DB::raw`) are strictly avoided when dealing with user-supplied data.
- Input validation ensures that parameters match expected data types before reaching the query layer.

## 2. Cross-Site Scripting (XSS) Prevention
- User inputs, especially public application reviews and product descriptions, are sanitized before being stored or retrieved.
- The frontend (React) automatically escapes variables rendered in the DOM, mitigating XSS attacks.
- If raw HTML is ever needed, it goes through a strict HTML purifier.
- The backend explicitly rejects malicious payload signatures using middleware or form requests when applicable.

## 3. Input Validation
- All API endpoints use Laravel Form Requests (`php artisan make:request`) to enforce strict validation rules.
- Required fields, such as `email`, `phone number`, `rating` (1-5 integer), `quantity`, `price`, `stock`, and discount values are validated for presence, type, and boundaries.
- The backend returns clear `422 Unprocessable Entity` responses with specific error messages for invalid inputs.

## 4. Session Behavior & Authentication
- Authentication is handled via API tokens (Laravel Sanctum/Passport) or HTTP-Only cookies.
- Logout endpoints strictly invalidate and delete the active token/session to ensure the user is logged out server-side.
- Tokens have a reasonable expiration time to limit the window of opportunity for stolen tokens.

## 5. Role-Based Access Control (RBAC)
- SEAPEDIA supports multiple roles per user (`Admin`, `Seller`, `Buyer`, `Driver`).
- Authorization is explicitly verified server-side based on the **currently active role** supplied by the client, not just the list of roles the user owns.
- Middleware (`RoleMiddleware`) intercepts requests and checks if the authenticated user's active role has permission to perform the action.
- A user cannot manipulate resources they do not own (e.g., a Seller cannot modify another Seller's product; a Driver cannot take an already taken job).
- Admin-only routes are heavily protected and strictly require the `Admin` active role.

## Security Test Cases Validation
- **XSS in Reviews**: Submitting `<script>alert(1)</script>` in the application review comment field results in the exact string being stored and rendered safely as text, not executed as code.
- **SQLi in Forms**: Inputting `' OR 1=1 --` into login, search, or checkout forms is safely treated as a literal string by the ORM, preventing any unauthorized query execution or logic bypass.
