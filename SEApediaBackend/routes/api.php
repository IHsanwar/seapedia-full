<?php

use Illuminate\Http\Request;
use App\Http\Controllers\Api\Page\CatalogueController;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Support\Facades\Route;
require __DIR__.'/api/auth.php';
require __DIR__.'/api/admin.php';
require __DIR__.'/api/review.php';
require __DIR__.'/api/seller.php';
require __DIR__.'/api/product.php';



Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile/dashboard', [ProfileController::class, 'dashboard']);
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
});

Route::prefix('v1')->group(function () {
    Route::get('/products', [CatalogueController::class, 'index']);
    Route::get('/products/{productSlug}', [CatalogueController::class, 'show']);
    Route::get('/stores/{storeSlug}', [CatalogueController::class, 'showStore']);
});

