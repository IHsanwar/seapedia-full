<?php

use App\Http\Controllers\Api\Seller\StoreController;
use App\Http\Controllers\Api\Seller\ProductController;
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
});
