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
        Schema::create('vouchers', function (Blueprint $table) {
    $table->id();

    $table->string('code')->unique();

    $table->enum('type', [
            'fixed',
            'percent'
        ]);

        $table->decimal('value', 15, 2);

        $table->decimal('max_discount', 15, 2)->nullable();

        $table->decimal('minimum_purchase', 15, 2)->default(0);

        $table->unsignedInteger('remaining_usage')->default(0);

        $table->timestamp('expired_at');

        $table->boolean('is_active')->default(true);

        $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vouchers');
    }
};
