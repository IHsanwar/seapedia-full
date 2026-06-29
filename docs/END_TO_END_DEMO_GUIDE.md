# SEAPEDIA End-to-End Demo Guide

This document provides a step-by-step guide to testing the entire end-to-end flow of the SEAPEDIA marketplace.

## Prerequisites
Ensure the application is running and the database has been seeded (`php artisan migrate:fresh --seed`). This provides demo accounts for all roles.

## Step 1: Guest Browsing and Application Review (Level 1)
1. **Browse as Guest:** Open the frontend without logging in. You should be able to view the product catalog and click on items to view product details.
2. **Submit Public Review:** Navigate to the public review section on the landing page and submit a review of the application. Observe that the review appears publicly without requiring authentication.

## Step 2: Buyer Checkout (Level 3 & 4)
1. **Login as Buyer:** Use a demo Buyer account (see `SEEDER_GUIDE.md` for credentials).
2. **Select Active Role:** If the account has multiple roles, select "Buyer".
3. **Add to Cart:** Navigate to a product and add it to your cart. Attempt to add a product from a *different* store and verify the "Single-Store Checkout" restriction appears.
4. **Checkout:** Proceed to the cart and click checkout. Note the calculation for Subtotal, Delivery Fee, PPN 12%, and Final Total. (Optionally apply a Voucher/Promo to see the discount logic).
5. **Complete Purchase:** Finish the checkout. The order status will now be `Sedang Dikemas` (Being Packed).

## Step 3: Seller Order Processing (Level 2 & 4)
1. **Login as Seller:** Log out and log in with the Seller account associated with the purchased product's store. Select the "Seller" role.
2. **Process Order:** Navigate to the Seller Dashboard -> Incoming Orders. Find the order placed by the Buyer and click "Process". The order status changes to `Menunggu Pengirim` (Waiting for Driver).

## Step 4: Driver Delivery (Level 5)
1. **Login as Driver:** Log out and log in with a Driver account. Select the "Driver" role.
2. **Find Job:** Go to the "Find Jobs" section. You should see the order you just processed as `Menunggu Pengirim`.
3. **Take Job:** Click "Take Job". The order status changes to `Sedang Dikirim` (Being Delivered).
4. **Complete Delivery:** Click "Confirm Completed". The order status becomes `Pesanan Selesai` (Order Completed). The Driver’s earnings will be updated based on the delivery fee.

## Step 5: Admin Monitoring & Overdue Handling (Level 6)
1. **Login as Admin:** Log out and log in using `admin@seapedia.com` / `password`.
2. **Marketplace Monitoring:** View the statistics for Users, Stores, Orders, Deliveries, and Vouchers in the Admin Dashboard.
3. **Simulate Time (Overdue Demo):** 
   - Before simulating, place a new order as a Buyer and have the Seller process it (`Menunggu Pengirim`), but **do not** have a Driver take or complete it.
   - Use the Admin action "Simulate Next Day" (or run the artisan command `php artisan app:check-overdue-orders`).
   - Check the order status again. It should now be `Dikembalikan` (Returned) due to exceeding the SLA. Check the Buyer's wallet to see the refunded balance, and the Product's stock to verify restoration.
