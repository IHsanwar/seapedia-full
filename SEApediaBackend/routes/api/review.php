<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Page\ReviewController;


Route::prefix('v1/reviews')->group(function () {
    Route::get('/', [ReviewController::class, 'index']);
    Route::post('/', [ReviewController::class, 'store']);
});