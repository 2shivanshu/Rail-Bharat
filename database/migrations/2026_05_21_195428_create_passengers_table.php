<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('passengers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->string('name');
            $table->integer('age');
            $table->enum('gender', ['Male', 'Female', 'Other']);
            $table->string('coach_number')->nullable(); // Assigned coach (e.g. S1, A1)
            $table->integer('seat_number')->nullable();  // Assigned seat number
            $table->string('berth_preference')->nullable(); // e.g. Lower, Middle, Upper
            $table->enum('status', ['CNF', 'RAC', 'WL', 'CANCELLED'])->default('CNF'); // CNF = Confirmed, RAC = Reservation Against Cancellation, WL = Waiting List, CANCELLED = Cancelled
            $table->integer('wl_number')->nullable(); // WL / RAC position number
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('passengers');
    }
};
