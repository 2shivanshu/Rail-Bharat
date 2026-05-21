<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('train_id')->constrained('trains')->onDelete('cascade');
            $table->foreignId('schedule_id')->constrained('schedules')->onDelete('cascade');
            $table->string('pnr', 10)->unique();
            $table->timestamp('booking_date');
            $table->date('journey_date');
            $table->foreignId('source_station_id')->constrained('stations')->onDelete('cascade');
            $table->foreignId('destination_station_id')->constrained('stations')->onDelete('cascade');
            $table->enum('class_type', ['SL', '3A', '2A', '1A', 'CC']);
            $table->decimal('total_fare', 10, 2);
            $table->enum('status', ['Pending', 'Booked', 'Cancelled', 'Partial'])->default('Pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
