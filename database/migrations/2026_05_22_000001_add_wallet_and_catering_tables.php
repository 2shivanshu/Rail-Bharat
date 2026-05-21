<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Alter role enum to include agent
        if (\DB::connection()->getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('passenger', 'admin', 'agent') DEFAULT 'passenger'");
        }

        // Add wallet balance to users
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'wallet_balance')) {
                $table->decimal('wallet_balance', 10, 2)->default(0.00)->after('role');
            }
        });

        // Create wallet transactions table
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->enum('type', ['Credit', 'Debit']);
            $table->string('description');
            $table->timestamps();
        });

        // Create meal options table
        Schema::create('meal_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('station_id')->constrained('stations')->onDelete('cascade');
            $table->string('item_name');
            $table->string('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->boolean('is_available')->default(true);
            $table->timestamps();
        });

        // Create catering orders table
        Schema::create('catering_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->foreignId('station_id')->constrained('stations')->onDelete('cascade');
            $table->text('item_details'); // Store item breakdown in JSON or string form
            $table->decimal('total_price', 10, 2);
            $table->enum('payment_status', ['Pending', 'Success', 'Refunded'])->default('Pending');
            $table->enum('delivery_status', ['Placed', 'Out For Delivery', 'Delivered', 'Cancelled'])->default('Placed');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('catering_orders');
        Schema::dropIfExists('meal_options');
        Schema::dropIfExists('wallet_transactions');
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'wallet_balance')) {
                $table->dropColumn('wallet_balance');
            }
        });
        if (\DB::connection()->getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('passenger', 'admin') DEFAULT 'passenger'");
        }
    }
};
