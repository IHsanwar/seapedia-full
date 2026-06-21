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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            $table->string('order_number')->unique();

            $table->foreignId('buyer_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('store_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('address_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('voucher_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->foreignId('promo_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->enum('delivery_method', [
                'instant',
                'next_day',
                'regular'
            ]);

            $table->decimal('subtotal', 15, 2);

            $table->decimal('discount', 15, 2)->default(0);

            $table->decimal('delivery_fee', 15, 2);

            $table->decimal('tax', 15, 2);

            $table->decimal('total', 15, 2);

            $table->string('status')->default('Sedang Dikemas');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
