<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Promotion\VoucherController;
use App\Http\Controllers\Api\Promotion\PromoController;

Route::prefix('v1/admin')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::apiResource('users', UserController::class);

    // Voucher management routes
    Route::apiResource('vouchers', VoucherController::class);

    // Promo management routes
    Route::apiResource('promos', PromoController::class);
});
