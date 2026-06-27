<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('analyze:driver-delivery', function () {
    $this->call(\App\Console\Commands\AnalyzeDriverDelivery::class);
})->purpose('Analyze relationship between drivers and deliveries');
