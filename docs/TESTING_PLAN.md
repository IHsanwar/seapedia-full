# Backend API Documentation & Testing Strategy

This document describes the SEAPEDIA Backend API architecture, API documentation generation, testing strategy, and performance testing plan. It is intended to support the final submission requirements by documenting how the backend is validated for correctness, reliability, and security.

---

# 1. API System Overview

SEAPEDIA Backend is developed using **Laravel 13** and exposes RESTful APIs protected by **Laravel Sanctum** authentication and **Role-Based Access Control (RBAC)**.

The application supports four primary roles:

- Buyer
- Seller
- Driver
- Admin

Every API endpoint is grouped based on the active role.

## API Modules

### Authentication

Responsible for authentication and role management.

Features:

- Register
- Login
- Logout
- Get Current User
- Switch Active Role
- Add New Role

Authentication uses Laravel Sanctum Personal Access Token with token abilities for active-role verification.

---

### Buyer

Buyer APIs include:

- Wallet
- Wallet Transactions
- Address Management
- Shopping Cart
- Checkout
- Voucher Validation
- Promo Validation
- Order History
- Order Detail
- Spending Report

---

### Seller

Seller APIs include:

- Store Management
- Product Management
- Incoming Orders
- Process Orders
- Revenue Report

---

### Driver

Driver APIs include:

- Driver Registration
- Available Delivery Jobs
- My Delivery Jobs
- Take Delivery Job
- Complete Delivery

---

### Admin

Admin APIs include:

- Dashboard Monitoring
- User Monitoring
- Store Monitoring
- Product Monitoring
- Order Monitoring
- Delivery Monitoring
- Voucher Management
- Promo Management
- Overdue Monitoring
- Refund Processing
- Time Simulation

---

### Public APIs

Public APIs include:

- Product Catalogue
- Store Catalogue
- Public Reviews

---

## API Documentation

API documentation is generated automatically using **Laravel Scribe**.

Documentation includes:

- Endpoint descriptions
- Authentication requirements
- Request examples
- Response examples
- Validation rules

After generation, documentation is available through:

```
/docs
```

---

# 2. Backend Testing Strategy

The backend is primarily tested using **Laravel Feature Tests** because most business logic is executed through HTTP requests, middleware, services, and database transactions.

Where appropriate, isolated Unit Tests may also be created for reusable service classes.

Testing focuses on validating business rules defined in the SEAPEDIA specification rather than only checking HTTP responses.

---

# 3. Feature Testing Plan

## Authentication

Verify:

- User registration
- Login success
- Login failure
- Logout
- Current user endpoint
- Switch active role
- Add additional role
- Sanctum token generation
- Sanctum token revocation

---

## Authorization

Verify Role Middleware.

Test cases:

- Buyer cannot access Seller APIs
- Buyer cannot access Admin APIs
- Seller cannot access Buyer-only endpoints
- Driver cannot access Admin endpoints
- Guest cannot access protected endpoints

Expected responses:

```
401 Unauthorized
403 Forbidden
```

---

## Wallet

Verify:

- Wallet creation
- Dummy top-up
- Wallet balance update
- Wallet transaction history
- Checkout balance deduction
- Refund transaction
- Insufficient balance validation

Business Rules

- Buyer only
- Wallet cannot become negative
- Every balance change must create WalletTransaction

---

## Address

Verify:

- Create address
- Update address
- Delete address
- Set default address
- Buyer ownership validation

---

## Shopping Cart

Verify:

- Add product
- Update quantity
- Remove product
- Cart summary
- Empty cart

Business Rules

- Cart only accepts products from one store
- Products from another store are rejected
- Quantity cannot exceed stock

---

## Checkout

This is the most critical module.

Verify:

- Successful checkout
- Wallet deduction
- Product stock deduction
- Order creation
- Order Item creation
- Delivery creation
- Status History creation
- Cart cleanup

Business Rules

- Insufficient wallet prevents checkout
- Insufficient stock prevents checkout
- Stock never becomes negative
- Initial status is:

```
Sedang Dikemas
```

---

## Voucher

Verify:

- Voucher validation
- Expired voucher rejection
- Remaining usage validation
- Minimum purchase validation
- Usage decrement after checkout

Business Rules

- Expired vouchers cannot be used
- Remaining usage cannot become negative

---

## Promo

Verify:

- Promo validation
- Expired promo rejection
- Discount calculation

Business Rules

- Promo has no usage limit
- Expired promo cannot be used

---

## Discount Calculation

Verify checkout summary contains:

- Subtotal
- Discount
- Delivery Fee
- PPN 12%
- Final Total

Business Rule

Voucher and Promo cannot be combined.

The system automatically applies the larger discount.

---

## Seller

Verify:

- Incoming orders
- Process order
- Status update
- Status history creation

Business Rules

Status changes:

```
Sedang Dikemas
↓

Menunggu Pengirim
```

Only the order owner may process the order.

---

## Driver

Verify:

- Driver registration
- View available jobs
- Take delivery
- Complete delivery
- Driver earnings calculation

Business Rules

Delivery flow:

```
Waiting Driver
↓

In Progress
↓

Completed
```

Only one driver may claim a delivery.

---

## Admin

Verify:

- Dashboard statistics
- Voucher CRUD
- Promo CRUD
- User monitoring
- Store monitoring
- Order monitoring
- Delivery monitoring
- Overdue processing
- Refund processing

---

## Reports

Verify:

Buyer

- Spending summary
- Order history
- Transaction details

Seller

- Revenue summary
- Incoming orders
- Processed orders

---

# 4. Security Testing

Security testing validates Level 7 requirements.

## Authentication

Verify:

- Invalid credentials
- Missing token
- Invalid token
- Revoked token

---

## Authorization

Verify:

- Role Middleware
- Resource ownership

Example:

Buyer cannot access another Buyer's order.

Expected:

```
404 Not Found
```

instead of exposing the resource.

---

## SQL Injection

Attempt SQL Injection on:

- Login
- Search
- Product filters

Expected result

No injection succeeds because Laravel Eloquent uses parameterized queries.

---

## Cross Site Scripting (XSS)

Attempt XSS on:

- Reviews
- Profile fields

Expected result

Frontend renders escaped text.

---

## Validation

Verify:

- Invalid email
- Invalid phone number
- Password length
- Required fields
- Quantity validation
- Voucher validation

---

## Transaction Safety

Verify:

- Database rollback on failed checkout
- Atomic checkout transaction
- Wallet consistency
- Stock consistency

---

## Race Condition

Verify concurrent requests:

- Two buyers buying the last stock
- Two drivers taking the same delivery

Expected:

Only one request succeeds.

---

# 5. Stress Testing Strategy

Stress testing evaluates backend stability under heavy load.

Recommended Tool

```
k6
```

Reasons:

- Lightweight
- Scriptable
- Easy CI integration
- JSON reporting
- Modern JavaScript syntax

---

## Stress Test Scenarios

### Product Catalogue

Simulate hundreds of users browsing products simultaneously.

Measure:

- Latency
- Throughput

---

### Authentication

Simulate mass login requests.

Measure:

- Authentication latency
- Error rate

---

### Checkout

Simulate multiple buyers checking out simultaneously.

Verify:

- Stock consistency
- Wallet consistency
- Transaction integrity

---

### Driver Delivery

Simulate multiple drivers attempting to claim the same delivery.

Verify:

- No duplicate assignments
- Proper database locking

---

### Admin Dashboard

Stress monitoring endpoints with large datasets.

Measure:

- Response time
- Database performance

---

# 6. Performance Metrics

Monitor:

- Average Response Time
- P95 Response Time
- Requests Per Second
- Error Rate
- CPU Usage
- Memory Usage
- Database Connections

Target

| Metric | Target |
|---------|---------|
| Average Response | < 200 ms |
| P95 Response | < 500 ms |
| Error Rate | < 1% |
| Availability | > 99% |

---

# 7. Testing Tools

Backend Testing

- PHPUnit
- Laravel Feature Test
- RefreshDatabase
- Model Factories
- Database Seeders

API Documentation

- Laravel Scribe

Performance Testing

- k6

---

# 8. Success Criteria

Backend testing is considered successful when:

- All Feature Tests pass
- No failed assertions
- No database inconsistencies
- No negative stock values
- No negative wallet balances
- No duplicate delivery assignments
- Voucher and Promo validations work correctly
- Checkout transaction remains atomic
- Role-based authorization is enforced correctly
- API documentation is successfully generated

---

# 9. Future Improvements

Potential improvements beyond the challenge scope:

- Continuous Integration (GitHub Actions)
- Automated API testing in CI/CD
- Test Coverage Report
- Static Analysis (PHPStan)
- Code Style Validation (Laravel Pint)
- Load Testing Pipeline
- End-to-End Testing using Playwright or Cypress

---

This testing strategy ensures that the SEAPEDIA Backend is functionally correct, secure, and capable of supporting the complete Buyer, Seller, Driver, and Admin workflows defined in the project specification.