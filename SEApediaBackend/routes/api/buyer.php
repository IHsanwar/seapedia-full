<?php

use App\Http\Controllers\Api\Buyer\WalletController;
use App\Http\Controllers\Api\Buyer\AddressController;
use App\Http\Controllers\Api\Buyer\CartController;
use App\Http\Controllers\Api\Buyer\OrderController;
use App\Http\Controllers\Api\Promotion\VoucherController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:buyer'])->prefix('v1/buyer')->group(function () {
    Route::prefix('wallet')->group(function () {
        Route::get('/', [WalletController::class, 'index']);
        Route::get('/show', [WalletController::class, 'show']);
        Route::get('/transactions', [WalletController::class, 'transactions']);
        Route::post('/topup', [WalletController::class, 'topup']);
    });

    Route::prefix('addresses')->group(function () {
        Route::get('/', [AddressController::class, 'index']);
        Route::post('/', [AddressController::class, 'store']);
        Route::get('/{id}', [AddressController::class, 'show']);
        Route::put('/{id}', [AddressController::class, 'update']);
        Route::delete('/{id}', [AddressController::class, 'destroy']);
        Route::post('/{id}/set-default', [AddressController::class, 'setDefault']);
    });

    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'index']);
        Route::post('/', [CartController::class, 'store']);
        Route::put('/{id}', [CartController::class, 'update']);
        Route::delete('/{id}', [CartController::class, 'destroy']);
        Route::delete('/', [CartController::class, 'clear']);
    });

    Route::prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::get('/{id}', [OrderController::class, 'show']);
        Route::post('/checkout', [OrderController::class, 'checkout']);
        Route::post('/apply-voucher', [OrderController::class, 'applyVoucher']);
    });

    // Voucher routes for buyers
    Route::prefix('vouchers')->group(function () {
        Route::get('/available', [VoucherController::class, 'availableVouchers']);
        Route::get('/{id}', [VoucherController::class, 'show']);
    });
});