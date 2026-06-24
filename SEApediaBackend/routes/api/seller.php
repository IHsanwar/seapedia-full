<?php

use App\Http\Controllers\Api\Seller\StoreController;
use App\Http\Controllers\Api\Seller\ProductController;
use App\Http\Controllers\Api\Seller\OrderController;
use App\Http\Controllers\Api\Seller\ReportController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:seller'])->prefix('v1/seller')->group(function () {
    // Store routes
    Route::post('/store', [StoreController::class, 'store']);
    Route::put('/store', [StoreController::class, 'update']);
    Route::get('/store', [StoreController::class, 'show']);
    Route::delete('/store', [StoreController::class, 'destroy']);

    // Product resource routes
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{id}', [ProductController::class, 'show']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Order routes
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders/process', [OrderController::class, 'process']);

    // Report routes
    Route::prefix('reports')->group(function () {
        Route::get('/income', [ReportController::class, 'incomeReport']);
        Route::get('/orders', [ReportController::class, 'orderList']);
        Route::get('/processed-orders', [ReportController::class, 'processedOrders']);
    });
});
