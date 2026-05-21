<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TrainController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ComplaintController;
use App\Http\Controllers\DashboardController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Welcome / Landing search page
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'stations' => \App\Models\Station::all(),
    ]);
})->name('home');

// Authenticated Routes
Route::middleware(['auth', 'verified'])->group(function () {
    
    // Unified Role-Based Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('/notifications/{id}/read', [DashboardController::class, 'readNotification'])->name('notifications.read');

    // Profile management
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Train Search & Route map
    Route::get('/trains/search', [TrainController::class, 'search'])->name('trains.search');
    Route::get('/trains/{train}/route', [TrainController::class, 'routeMap'])->name('trains.route');
    Route::get('/trains/availability', [TrainController::class, 'liveAvailability'])->name('trains.availability');

    // Booking Flow
    Route::get('/bookings/create', [BookingController::class, 'createForm'])->name('booking.create');
    Route::post('/bookings', [BookingController::class, 'store'])->name('booking.store');
    Route::get('/bookings/{pnr}', [BookingController::class, 'show'])->name('booking.show');
    Route::post('/bookings/{booking}/cancel', [BookingController::class, 'cancel'])->name('booking.cancel');

    // Simulated Payment Gateway
    Route::get('/payment/{booking}', [BookingController::class, 'showPayment'])->name('payment.show');
    Route::post('/payment/{booking}/process', [BookingController::class, 'processPayment'])->name('payment.process');

    // Passenger Assistance & Complaints Center
    Route::get('/complaints', [ComplaintController::class, 'index'])->name('complaints.index');
    Route::post('/complaints', [ComplaintController::class, 'store'])->name('complaints.store');
    Route::post('/complaints/sos', [ComplaintController::class, 'sos'])->name('complaints.sos');

    // Admin Control Panels
    Route::middleware('can:admin-only')->group(function () {
        // Train Management CRUD
        Route::get('/admin/trains', [TrainController::class, 'index'])->name('admin.trains.index');
        Route::post('/admin/trains', [TrainController::class, 'store'])->name('admin.trains.store');
        Route::patch('/admin/trains/{train}', [TrainController::class, 'update'])->name('admin.trains.update');
        Route::delete('/admin/trains/{train}', [TrainController::class, 'destroy'])->name('admin.trains.destroy');

        // Schedule Updates & Delays
        Route::post('/admin/schedules/{id}/delay', [DashboardController::class, 'updateScheduleDelay'])->name('admin.schedules.delay');

        // Complaints resolution
        Route::post('/admin/complaints/{id}/resolve', [ComplaintController::class, 'resolve'])->name('admin.complaints.resolve');
    });
});

require __DIR__.'/auth.php';
