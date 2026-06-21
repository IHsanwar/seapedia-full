<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       Schema::create('deliveries', function (Blueprint $table) {
    $table->id();

    $table->foreignId('order_id')
        ->constrained()
        ->cascadeOnDelete();

    // nullable karena belum ada driver yang mengambil job
    $table->foreignId('driver_id')
        ->nullable()
        ->constrained('users')
        ->nullOnDelete();

    $table->enum('method', [
        'instant',
        'next_day',
        'regular'
    ]);

    $table->decimal('fee', 15, 2);

    $table->string('status')->default('waiting_driver');

    $table->timestamp('taken_at')->nullable();

    $table->timestamp('completed_at')->nullable();

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deliveries');
    }
};
