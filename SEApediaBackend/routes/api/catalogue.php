<?php

use App\Http\Controllers\Api\Page\CatalogueController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1/catalogue')->group(function () {
    Route::get('/products', [CatalogueController::class, 'index']);
    Route::get('/products/{productSlug}', [CatalogueController::class, 'show']);
    Route::get('/stores/{storeSlug}', [CatalogueController::class, 'showStore']);
});
