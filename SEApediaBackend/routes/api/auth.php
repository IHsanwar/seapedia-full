<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

Route::prefix('v1/auth')->group(function () {

    Route::post('/register', [AuthController::class, 'register'])->middleware('turnstile');

    Route::post('/login', [AuthController::class, 'login'])->middleware('turnstile');

    Route::middleware('auth:sanctum')->group(function () {

        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/switch-role', [AuthController::class, 'switchRole']);
        Route::post('/add-role', [AuthController::class, 'addRole']);
        Route::post('/logout', [AuthController::class, 'logout']);

    });

});