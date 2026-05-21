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
use App\Models\MealOption;
use App\Models\CateringOrder;
use App\Models\WalletTransaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;

class AdvancedFeaturesTest extends TestCase
{
    use RefreshDatabase;

    private $agent;
    private $passenger;
    private $ndls;
    private $hwh;
    private $train;
    private $schedule;
    private $coach;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Create Users
        $this->agent = User::factory()->create([
            'role' => 'agent',
            'wallet_balance' => 10000.00
        ]);
        $this->passenger = User::factory()->create([
            'role' => 'passenger'
        ]);

        // 2. Create Stations
        $this->ndls = Station::create(['name' => 'New Delhi', 'code' => 'NDLS', 'city' => 'Delhi']);
        $this->hwh = Station::create(['name' => 'Howrah Junction', 'code' => 'HWH', 'city' => 'Kolkata']);

        // 3. Create Train
        $this->train = Train::create([
            'train_number' => '12301',
            'name' => 'Howrah Rajdhani Express',
            'type' => 'Rajdhani',
            'source_station_id' => $this->ndls->id,
            'destination_station_id' => $this->hwh->id,
            'runs_on' => '1,2,3,4,5,6,7',
        ]);

        // 4. Create Routes
        Route::create([
            'train_id' => $this->train->id,
            'station_id' => $this->ndls->id,
            'stop_number' => 1,
            'arrival_time' => null,
            'departure_time' => '16:55:00',
            'distance_from_source' => 0,
            'fare_factor' => 1.00,
        ]);
        Route::create([
            'train_id' => $this->train->id,
            'station_id' => $this->hwh->id,
            'stop_number' => 2,
            'arrival_time' => '09:55:00',
            'departure_time' => null,
            'distance_from_source' => 1450,
            'fare_factor' => 1.50,
        ]);

        // 5. Create Coach (SL with 8 seats layout)
        $this->coach = Coach::create([
            'train_id' => $this->train->id,
            'coach_number' => 'S1',
            'class_type' => 'SL',
            'total_seats' => 8,
        ]);

        // 6. Create Schedule
        $this->schedule = Schedule::create([
            'train_id' => $this->train->id,
            'departure_date' => Carbon::today()->addDay()->format('Y-m-d'),
            'status' => 'Scheduled',
            'delay_minutes' => 0,
        ]);
    }

    /**
     * Test PNR lookup (Public PNR checker)
     */
    public function test_public_pnr_lookup(): void
    {
        // Create booking
        $booking = Booking::create([
            'user_id' => $this->passenger->id,
            'train_id' => $this->train->id,
            'schedule_id' => $this->schedule->id,
            'class_type' => 'SL',
            'source_station_id' => $this->ndls->id,
            'destination_station_id' => $this->hwh->id,
            'journey_date' => $this->schedule->departure_date,
            'booking_date' => Carbon::now(),
            'total_fare' => 500.00,
            'status' => 'Booked',
            'pnr' => '1234567890',
        ]);

        $passenger = Passenger::create([
            'booking_id' => $booking->id,
            'name' => 'John Doe',
            'age' => 30,
            'gender' => 'Male',
            'status' => 'CNF',
            'coach_number' => 'S1',
            'seat_number' => 5,
        ]);

        // Access public checker page (guest)
        $response = $this->get(route('pnr.checker'));
        $response->assertStatus(200);

        // Perform PNR Lookup
        $response = $this->post(route('pnr.lookup'), ['pnr' => '1234567890']);
        $response->assertStatus(200)
            ->assertJsonPath('booking.pnr', '1234567890')
            ->assertJsonPath('booking.passengers.0.name', 'John Doe')
            ->assertJsonPath('booking.passengers.0.seat_number', 5);
    }

    /**
     * Test Alternative Train Suggestions
     */
    public function test_alternative_train_suggestions(): void
    {
        // Query search trains for departure date
        $response = $this->actingAs($this->passenger)->get(route('trains.search', [
            'source' => 'NDLS',
            'destination' => 'HWH',
            'date' => Carbon::today()->addDay()->format('Y-m-d'),
        ]));

        $response->assertStatus(200);
        
        // Assert that alternative suggestions list contains adjacent days
        $props = $response->original->getData()['page']['props'];
        $this->assertNotEmpty($props['alternatives']);
        $altDates = collect($props['alternatives'])->pluck('date')->toArray();
        $this->assertContains(Carbon::today()->addDays(2)->format('Y-m-d'), $altDates);
    }

    /**
     * Test Live Train Tracking
     */
    public function test_live_train_tracking(): void
    {
        $response = $this->actingAs($this->passenger)->get(route('trains.tracking', [
            'schedule_id' => $this->schedule->id
        ]));

        $response->assertStatus(200);
        $props = $response->original->getData()['page']['props'];
        $this->assertEquals($this->schedule->id, $props['schedule']['id']);
        $this->assertNotEmpty($props['routes']);
    }

    /**
     * Test Agent Portal and Wallet Deposit
     */
    public function test_agent_portal_and_wallet_deposit(): void
    {
        // View Agent Dashboard
        $response = $this->actingAs($this->agent)->get(route('agent.dashboard'));
        $response->assertStatus(200);
        $props = $response->original->getData()['page']['props'];
        $this->assertEquals(10000.00, $props['stats']['wallet_balance']);

        // Deposit Money
        $response = $this->actingAs($this->agent)->post(route('agent.deposit'), [
            'amount' => 500.00
        ]);
        $response->assertRedirect();
        
        $this->agent->refresh();
        $this->assertEquals(10500.00, $this->agent->wallet_balance);
        $this->assertDatabaseHas('wallet_transactions', [
            'user_id' => $this->agent->id,
            'amount' => 500.00,
            'type' => 'Credit',
            'description' => 'Wallet Top-Up (Simulated)'
        ]);
    }

    /**
     * Test Agent Wallet Payment with 2% Commission Cashback
     */
    public function test_agent_wallet_payment_with_cashback(): void
    {
        // Create a pending booking for agent
        $booking = Booking::create([
            'user_id' => $this->agent->id,
            'train_id' => $this->train->id,
            'schedule_id' => $this->schedule->id,
            'class_type' => 'SL',
            'source_station_id' => $this->ndls->id,
            'destination_station_id' => $this->hwh->id,
            'journey_date' => $this->schedule->departure_date,
            'booking_date' => Carbon::now(),
            'total_fare' => 1000.00,
            'status' => 'Pending',
            'pnr' => 'AGENTPNR12',
        ]);

        Passenger::create([
            'booking_id' => $booking->id,
            'name' => 'Agent Passenger',
            'age' => 35,
            'gender' => 'Male',
            'status' => 'WL',
        ]);

        Payment::create([
            'booking_id' => $booking->id,
            'payment_status' => 'Pending',
            'payment_method' => 'Wallet',
            'transaction_id' => 'TXN-' . uniqid(),
            'amount' => 1000.00,
        ]);

        // Process payment
        $response = $this->actingAs($this->agent)->post(route('payment.process', ['booking' => $booking->id]), [
            'payment_status' => 'Success',
            'payment_method' => 'Wallet',
        ]);

        $response->assertRedirect(route('booking.show', ['pnr' => 'AGENTPNR12']));

        $booking->refresh();
        $this->assertEquals('Booked', $booking->status);
        $this->assertEquals('Success', $booking->payment->payment_status);

        // Balance check: 10000 - 1000 + (1000 * 0.02) = 9020
        $this->agent->refresh();
        $this->assertEquals(9020.00, $this->agent->wallet_balance);

        // Verify transactions
        $this->assertDatabaseHas('wallet_transactions', [
            'user_id' => $this->agent->id,
            'amount' => 1000.00,
            'type' => 'Debit',
            'description' => 'Ticket Booking for PNR: AGENTPNR12'
        ]);

        $this->assertDatabaseHas('wallet_transactions', [
            'user_id' => $this->agent->id,
            'amount' => 20.00,
            'type' => 'Credit',
            'description' => '2% Booking Commission Cashback for PNR: AGENTPNR12'
        ]);
    }

    /**
     * Test E-Catering Meal catalog and ordering via Wallet
     */
    public function test_ecatering_catalog_and_wallet_order(): void
    {
        // Create booking for agent
        $booking = Booking::create([
            'user_id' => $this->agent->id,
            'train_id' => $this->train->id,
            'schedule_id' => $this->schedule->id,
            'class_type' => 'SL',
            'source_station_id' => $this->ndls->id,
            'destination_station_id' => $this->hwh->id,
            'journey_date' => $this->schedule->departure_date,
            'booking_date' => Carbon::now(),
            'total_fare' => 500.00,
            'status' => 'Booked',
            'pnr' => 'AGENTPNR55',
        ]);

        // Seed a meal option
        $meal = MealOption::create([
            'station_id' => $this->ndls->id,
            'item_name' => 'Veg Deluxe Thali',
            'description' => 'Delicious North Indian Thali',
            'price' => 150.00,
            'is_available' => true
        ]);

        // Fetch catering catalog
        $response = $this->actingAs($this->agent)->get(route('catering.catalog', ['pnr' => 'AGENTPNR55']));
        $response->assertStatus(200);
        $props = $response->original->getData()['page']['props'];
        $this->assertCount(1, $props['stationsWithMeals']);
        $this->assertEquals('Veg Deluxe Thali', $props['stationsWithMeals'][0]['meals'][0]['item_name']);

        // Order meals
        $response = $this->actingAs($this->agent)->post(route('catering.order'), [
            'booking_id' => $booking->id,
            'station_id' => $this->ndls->id,
            'items' => [
                [
                    'item_id' => $meal->id,
                    'item_name' => 'Veg Deluxe Thali',
                    'quantity' => 2,
                    'price' => 150.00
                ]
            ],
            'total_price' => 300.00
        ]);

        $response->assertRedirect();
        
        // Assert wallet deduction (10000 - 300 = 9700)
        $this->agent->refresh();
        $this->assertEquals(9700.00, $this->agent->wallet_balance);

        $this->assertDatabaseHas('catering_orders', [
            'booking_id' => $booking->id,
            'station_id' => $this->ndls->id,
            'total_price' => 300.00,
            'payment_status' => 'Success',
            'delivery_status' => 'Placed'
        ]);

        $this->assertDatabaseHas('wallet_transactions', [
            'user_id' => $this->agent->id,
            'amount' => 300.00,
            'type' => 'Debit',
            'description' => 'E-Catering Meal Order for PNR: AGENTPNR55'
        ]);
    }

    /**
     * Test Bidirectional Train Search (Forward & Reverse)
     */
    public function test_bidirectional_train_search(): void
    {
        // Create reverse train (HWH to NDLS)
        $reverseTrain = Train::create([
            'train_number' => '12302',
            'name' => 'Kolkata New Delhi Rajdhani Express',
            'type' => 'Rajdhani',
            'source_station_id' => $this->hwh->id,
            'destination_station_id' => $this->ndls->id,
            'runs_on' => '1,2,3,4,5,6,7',
        ]);

        // Route for reverse train (stop 1 is HWH, stop 2 is NDLS)
        Route::create([
            'train_id' => $reverseTrain->id,
            'station_id' => $this->hwh->id,
            'stop_number' => 1,
            'arrival_time' => null,
            'departure_time' => '15:00:00',
            'distance_from_source' => 0,
            'fare_factor' => 1.00,
        ]);
        Route::create([
            'train_id' => $reverseTrain->id,
            'station_id' => $this->ndls->id,
            'stop_number' => 2,
            'arrival_time' => '06:00:00',
            'departure_time' => null,
            'distance_from_source' => 1450,
            'fare_factor' => 1.50,
        ]);

        // Create coach for reverse train
        Coach::create([
            'train_id' => $reverseTrain->id,
            'coach_number' => 'S1',
            'class_type' => 'SL',
            'total_seats' => 8,
        ]);

        // Search from NDLS to HWH
        $response = $this->actingAs($this->passenger)->get(route('trains.search', [
            'source' => 'NDLS',
            'destination' => 'HWH',
            'date' => Carbon::today()->addDay()->format('Y-m-d'),
        ]));

        $response->assertStatus(200);
        $props = $response->original->getData()['page']['props'];

        // Assert we got both forward (12301) and reverse (12302) trains in the results
        $trainNumbers = collect($props['trains'])->pluck('train_number')->toArray();
        $this->assertContains('12301', $trainNumbers);
        $this->assertContains('12302', $trainNumbers);

        // Find the reverse train in results and check attributes
        $resultReverseTrain = collect($props['trains'])->firstWhere('train_number', '12302');
        $this->assertTrue($resultReverseTrain['is_reverse']);
        // Verify source departure and dest arrival time for reverse train in NDLS->HWH search
        // Since we are searching NDLS to HWH, NDLS is source (stop 2, arrival 06:00:00)
        // and HWH is destination (stop 1, departure 15:00:00)
        $this->assertEquals('15:00:00', $resultReverseTrain['source_departure']);
        $this->assertEquals('06:00:00', $resultReverseTrain['dest_arrival']);
    }
}

