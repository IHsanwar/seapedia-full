# SEAPEDIA Business Rules

This document outlines the core business rules implemented in the SEAPEDIA backend system to govern marketplace operations.

## 1. Single-Store Checkout Behavior
- **Rule:** One cart may only contain products from **one store** at a time.
- **Enforcement:** When a buyer adds a product to their cart, the system checks the store ID of the product against the store ID of items currently in the cart. 
- **Conflict Handling:** If a buyer attempts to add a product from a different store, the backend returns a `409 Conflict` (or `422 Unprocessable Entity`) indicating that the cart contains items from a different store. The frontend should prompt the buyer to clear the cart first.

## 2. Discount Rule: Vouchers vs. Promos
- **Vouchers:** Have an expiry date AND a remaining usage count (e.g., valid for the first 100 users).
- **Promos:** Have an expiry date but unlimited usage during the active period.
- **Combination Rule:** Currently, a buyer may apply **only one** discount code (either a Voucher OR a Promo) per checkout. Combining multiple discount codes is not permitted.
- **Validation:** Expired vouchers/promos, or vouchers with 0 remaining usage, are rejected during checkout.

## 3. PPN 12% Calculation Rule
- **Calculation Order:**
  1. Calculate `Subtotal` = Sum of (Item Price * Quantity)
  2. Apply `Discount` (from Voucher or Promo) to the Subtotal.
  3. `Discounted Subtotal` = Subtotal - Discount
  4. Apply `PPN 12%` = `Discounted Subtotal` * 0.12
  5. Add `Delivery Fee` (based on delivery method)
  6. `Final Total` = `Discounted Subtotal` + `PPN 12%` + `Delivery Fee`
- **Visibility:** All these variables (Subtotal, Discount, PPN 12%, Delivery Fee, and Final Total) are explicitly returned by the checkout endpoint and displayed to the buyer.

## 4. Delivery Methods and SLAs (Service Level Agreements)
Delivery methods dictate the time allowed for the order to be completed before it becomes overdue.
- **Instant:** Expected to be completed within a few hours (SLA: same day).
- **Next Day:** Expected to be completed by the end of the following day (SLA: 1 day).
- **Regular:** Expected to be completed within standard delivery times (SLA: 3-5 days).

## 5. Overdue SLA and Time Simulation
- **Overdue Detection:** A scheduled task (cron/worker) or manual Admin trigger checks for active orders (`Sedang Dikemas`, `Menunggu Pengirim`, or `Sedang Dikirim`) that have exceeded their SLA based on the selected delivery method.
- **Auto Refund / Auto Return:** 
  - If an order is overdue and fails to be delivered on time, its status is updated to `Dikembalikan` (Returned).
  - The buyer's wallet is credited back the `Final Total` amount.
  - The product stock is restored.
  - The seller's income is reversed if it had been preemptively allocated.
  - Double refunds are prevented via transaction locks or idempotent refund flags.
- **Time Simulation:** For testing and demo purposes, an Admin endpoint (`/api/admin/simulate-time`) or an artisan command is provided to fast-forward the system time by 1 day and trigger the overdue checks.

## 6. Driver Earning Rule
- **Earning Calculation:** Drivers earn a fixed percentage (e.g., 80%) of the Delivery Fee for every successfully completed job.
- **Allocation:** The earning is credited to the Driver's balance only when the order status changes to `Pesanan Selesai`.
