<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coaches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('train_id')->constrained('trains')->onDelete('cascade');
            $table->string('coach_number'); // e.g. S1, A1, B1
            $table->enum('class_type', ['SL', '3A', '2A', '1A', 'CC']); // Sleeper, 3AC, 2AC, 1AC, Chair Car
            $table->integer('total_seats'); // e.g. 72 for SL, 64 for 3A
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coaches');
    }
};
