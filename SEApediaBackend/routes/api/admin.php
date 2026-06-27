<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\MonitorController;
use App\Http\Controllers\Api\Admin\OverdueController;
use App\Http\Controllers\Api\Promotion\VoucherController;
use App\Http\Controllers\Api\Promotion\PromoController;

Route::prefix('v1/admin')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::apiResource('users', UserController::class);

    // Voucher management routes
    Route::apiResource('vouchers', VoucherController::class);

    // Promo management routes
    Route::apiResource('promos', PromoController::class);

    // Dashboard & Statistics
    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::get('stats/users', [DashboardController::class, 'userStats']);
    Route::get('stats/orders', [DashboardController::class, 'orderStats']);
    Route::get('stats/deliveries', [DashboardController::class, 'deliveryStats']);

    // Monitoring
    Route::get('stores', [MonitorController::class, 'stores']);
    Route::get('stores/{store}', [MonitorController::class, 'storeDetail']);
    Route::get('products', [MonitorController::class, 'products']);
    Route::get('orders', [MonitorController::class, 'orders']);
    Route::get('orders/{order}', [MonitorController::class, 'orderDetail']);
    Route::get('deliveries', [MonitorController::class, 'deliveries']);
    Route::get('deliveries/{delivery}', [MonitorController::class, 'deliveryDetail']);

    // Overdue Handling
    Route::get('overdue-orders', [OverdueController::class, 'index']);
    Route::post('overdue/process', [OverdueController::class, 'processAll']);
    Route::post('overdue/{order}/refund', [OverdueController::class, 'refundSingle']);
    Route::post('simulate-next-day', [OverdueController::class, 'simulateNextDay']);
});
