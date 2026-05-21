<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Station;
use App\Models\Train;
use App\Models\Route;
use App\Models\Schedule;
use App\Models\Coach;
use App\Models\Booking;
use App\Models\Passenger;
use App\Models\Ticket;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingSystemTest extends TestCase
{
    use RefreshDatabase;

    public function test_e2e_booking_and_payment_and_cancellation(): void
    {
        // 1. Create a User
        $user = User::factory()->create(['role' => 'passenger']);

        // 2. Create Stations
        $ndls = Station::create(['name' => 'New Delhi', 'code' => 'NDLS', 'city' => 'Delhi']);
        $hwh = Station::create(['name' => 'Howrah Junction', 'code' => 'HWH', 'city' => 'Kolkata']);

        // 3. Create a Train
        $train = Train::create([
            'train_number' => '12301',
            'name' => 'Howrah Rajdhani Express',
            'type' => 'Rajdhani',
            'source_station_id' => $ndls->id,
            'destination_station_id' => $hwh->id,
            'runs_on' => '1,2,3,4,5,6,7',
        ]);

        // 4. Create Routes
        Route::create([
            'train_id' => $train->id,
            'station_id' => $ndls->id,
            'stop_number' => 1,
            'arrival_time' => null,
            'departure_time' => '16:55:00',
            'distance_from_source' => 0,
            'fare_factor' => 1.00,
        ]);
        Route::create([
            'train_id' => $train->id,
            'station_id' => $hwh->id,
            'stop_number' => 2,
            'arrival_time' => '09:55:00',
            'departure_time' => null,
            'distance_from_source' => 1450,
            'fare_factor' => 1.50,
        ]);

        // 5. Create Coach (say, 3A with 2 seats capacity to easily test RAC/WL)
        $coach = Coach::create([
            'train_id' => $train->id,
            'coach_number' => 'B1',
            'class_type' => '3A',
            'total_seats' => 2,
        ]);

        // 6. Create a Schedule
        $schedule = Schedule::create([
            'train_id' => $train->id,
            'departure_date' => '2026-05-22',
            'status' => 'Scheduled',
            'delay_minutes' => 0,
        ]);

        // --- STEP 1: Test Booking Form Page ---
        $response = $this->actingAs($user)->get(route('booking.create', [
            'train_id' => $train->id,
            'schedule_id' => $schedule->id,
            'class_type' => '3A',
            'source' => 'NDLS',
            'destination' => 'HWH',
        ]));
        $response->assertStatus(200);

        // --- STEP 2: Store Booking (Pending status) ---
        $bookingData = [
            'train_id' => $train->id,
            'schedule_id' => $schedule->id,
            'class_type' => '3A',
            'source_station_id' => $ndls->id,
            'destination_station_id' => $hwh->id,
            'passengers' => [
                ['name' => 'Passenger One', 'age' => 30, 'gender' => 'Male', 'berth_preference' => 'Lower'],
                ['name' => 'Passenger Two', 'age' => 25, 'gender' => 'Female', 'berth_preference' => 'Upper'],
            ],
            'total_fare' => 750.00,
        ];

        $response = $this->actingAs($user)->post(route('booking.store'), $bookingData);
        
        $booking = Booking::where('user_id', $user->id)->first();
        $this->assertNotNull($booking);
        $this->assertEquals('Pending', $booking->status);
        $this->assertCount(2, $booking->passengers);
        $this->assertEquals('WL', $booking->passengers[0]->status); // initially WL in DB

        // Response redirects to payment page
        $response->assertRedirect(route('payment.show', ['booking' => $booking->id]));

        // --- STEP 3: Complete Payment Success (Assigned seats) ---
        $paymentData = [
            'payment_status' => 'Success',
            'payment_method' => 'UPI',
        ];

        $response = $this->actingAs($user)->post(route('payment.process', ['booking' => $booking->id]), $paymentData);
        $response->assertRedirect(route('booking.show', ['pnr' => $booking->pnr]));

        $booking->refresh();
        $this->assertEquals('Booked', $booking->status);
        $this->assertEquals('Success', $booking->payment->payment_status);

        $passengers = $booking->passengers()->orderBy('id')->get();
        $this->assertEquals('CNF', $passengers[0]->status);
        $this->assertEquals('B1', $passengers[0]->coach_number);
        $this->assertEquals(1, $passengers[0]->seat_number);

        $this->assertEquals('CNF', $passengers[1]->status);
        $this->assertEquals('B1', $passengers[1]->coach_number);
        $this->assertEquals(2, $passengers[1]->seat_number);

        // --- STEP 4: Make another booking when capacity is full (Should get RAC/WL) ---
        $user2 = User::factory()->create(['role' => 'passenger']);
        $bookingData2 = [
            'train_id' => $train->id,
            'schedule_id' => $schedule->id,
            'class_type' => '3A',
            'source_station_id' => $ndls->id,
            'destination_station_id' => $hwh->id,
            'passengers' => [
                ['name' => 'Passenger Three', 'age' => 45, 'gender' => 'Male'],
                ['name' => 'Passenger Four', 'age' => 40, 'gender' => 'Female'],
            ],
            'total_fare' => 750.00,
        ];

        // Store
        $this->actingAs($user2)->post(route('booking.store'), $bookingData2);
        $booking2 = Booking::where('user_id', $user2->id)->first();
        
        // Pay Success
        $this->actingAs($user2)->post(route('payment.process', ['booking' => $booking2->id]), $paymentData);
        
        $booking2->refresh();
        $passengers2 = $booking2->passengers()->orderBy('id')->get();

        // Since coach capacity is 2 and already booked:
        // Seat 3: should go to RAC (RAC limit is 10)
        $this->assertEquals('RAC', $passengers2[0]->status);
        $this->assertEquals('RAC', $passengers2[0]->coach_number);
        $this->assertEquals(1, $passengers2[0]->seat_number);

        // Seat 4: should go to RAC
        $this->assertEquals('RAC', $passengers2[1]->status);
        $this->assertEquals('RAC', $passengers2[1]->coach_number);
        $this->assertEquals(2, $passengers2[1]->seat_number);

        // --- STEP 5: Cancel a CNF ticket and verify RAC promotion ---
        $cancelData = [
            'passengers' => [$passengers[0]->id], // cancel Passenger One (who was CNF in B1-1)
        ];

        $response = $this->actingAs($user)->post(route('booking.cancel', ['booking' => $booking->id]), $cancelData);
        $response->assertRedirect(route('dashboard'));

        $passengers[0]->refresh();
        $this->assertEquals('CANCELLED', $passengers[0]->status);

        // Passenger Three (who was RAC 1) should be promoted to CNF in B1 seat 1
        $passengers2[0]->refresh();
        $this->assertEquals('CNF', $passengers2[0]->status);
        $this->assertEquals('B1', $passengers2[0]->coach_number);
        $this->assertEquals(1, $passengers2[0]->seat_number);

        // Passenger Four (who was RAC 2) should shift to RAC 1
        $passengers2[1]->refresh();
        $this->assertEquals('RAC', $passengers2[1]->status);
        $this->assertEquals('RAC', $passengers2[1]->coach_number);
        $this->assertEquals(1, $passengers2[1]->seat_number);
    }
}
