<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Page\ReviewController;


Route::prefix('v1')->group(function () {
    Route::get('/reviews', [ReviewController::class, 'index']);
    Route::post('/reviews', [ReviewController::class, 'store']);
});