<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Admin\UserController;

Route::prefix('v1/admin')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::apiResource('users', UserController::class);
});
