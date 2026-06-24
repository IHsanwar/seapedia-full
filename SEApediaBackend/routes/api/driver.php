<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Driver\DriverController;
use App\Http\Controllers\Api\Driver\DeliveryController;
Route::prefix('v1/driver')
    ->middleware(['auth:sanctum'])
    ->group(function () {

        Route::post('/register', [DriverController::class, 'register']);
    });

Route::prefix('v1/driver')
    ->middleware(['auth:sanctum', 'role:driver'])
    ->group(function () {

        Route::get('/profile', [DriverController::class, 'DriverProfile']);
        Route::get('/jobs', [DeliveryController::class, 'jobs']);

        Route::get('/my-jobs', [DeliveryController::class, 'myJobs']);

        Route::post('/jobs/{delivery}/take', [
            DeliveryController::class,
            'take'
        ]);

        Route::post('/jobs/{delivery}/complete', [
            DeliveryController::class,
            'complete'
        ]);
    });