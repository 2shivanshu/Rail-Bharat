<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('routes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('train_id')->constrained('trains')->onDelete('cascade');
            $table->foreignId('station_id')->constrained('stations')->onDelete('cascade');
            $table->integer('stop_number'); // 1 = Source, 2 = Stop 1, etc.
            $table->time('arrival_time')->nullable(); // Null for source station
            $table->time('departure_time')->nullable(); // Null for destination station
            $table->integer('distance_from_source')->default(0); // in km
            $table->decimal('fare_factor', 8, 2)->default(1.00); // multiplier for pricing
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('routes');
    }
};
