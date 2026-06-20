<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Page\ReviewController;


Route::get('/reviews', [ReviewController::class, 'index']);
Route::post('/reviews', [ReviewController::class, 'store']);