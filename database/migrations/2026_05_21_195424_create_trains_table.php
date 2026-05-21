<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trains', function (Blueprint $table) {
            $table->id();
            $table->string('train_number')->unique();
            $table->string('name');
            $table->enum('type', ['Express', 'Superfast', 'Rajdhani', 'Shatabdi', 'Passenger']);
            $table->foreignId('source_station_id')->constrained('stations')->onDelete('cascade');
            $table->foreignId('destination_station_id')->constrained('stations')->onDelete('cascade');
            $table->string('runs_on')->default('1,2,3,4,5,6,7'); // 1=Mon, 7=Sun
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trains');
    }
};
