<?php

use App\Http\Controllers\Api\Seller\StoreController;
use App\Http\Controllers\Api\Seller\ProductController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:seller'])->group(function () {
    // Store routes
    Route::post('/store', [StoreController::class, 'store']);
    Route::put('/store', [StoreController::class, 'update']);
    Route::get('/store', [StoreController::class, 'show']);
    Route::delete('/store', [StoreController::class, 'destroy']);

    // Product resource routes
    
});
