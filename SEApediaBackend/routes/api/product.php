<?php
use App\Http\Controllers\Api\Seller\ProductController;

Route::prefix('v1/product')
    ->middleware('auth:sanctum')
    ->group(function () {

        Route::post('product', [ProductController::class, 'store']);
        Route::put('product/{id}', [ProductController::class, 'update']);
        Route::delete('product/{id}', [ProductController::class, 'destroy']);
        Route::get('product/{id}', [ProductController::class, 'show']);
        Route::get('products', [ProductController::class, 'index']);
    });