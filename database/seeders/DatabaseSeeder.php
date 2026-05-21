<?php

namespace Database\Seeders;

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
use App\Models\Complaint;
use App\Models\Notification;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Core Users
        $admin = User::create([
            'name' => 'Admin Controller',
            'email' => 'admin@railway.gov.in',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        $passenger = User::create([
            'name' => 'Shivanshu Sharma',
            'email' => 'passenger@gmail.com',
            'password' => Hash::make('passenger123'),
            'role' => 'passenger',
            'email_verified_at' => now(),
        ]);

        $agent = User::create([
            'name' => 'Bharat Agent Services',
            'email' => 'agent@railway.gov.in',
            'password' => Hash::make('agent123'),
            'role' => 'agent',
            'wallet_balance' => 10000.00,
            'email_verified_at' => now(),
        ]);

        $fakePassengers = [];
        $names = ['Amit Kumar', 'Priya Patel', 'Rahul Singh', 'Neha Sharma', 'Rohan Verma', 'Anjali Gupta'];
        foreach ($names as $idx => $name) {
            $fakePassengers[] = User::create([
                'name' => $name,
                'email' => 'passenger' . ($idx + 1) . '@example.com',
                'password' => Hash::make('password'),
                'role' => 'passenger',
                'email_verified_at' => now(),
            ]);
        }

        // 2. Create Stations
        $stationsData = [
            ['name' => 'New Delhi', 'code' => 'NDLS', 'city' => 'New Delhi'],
            ['name' => 'Howrah Junction', 'code' => 'HWH', 'city' => 'Kolkata'],
            ['name' => 'KSR Bengaluru City', 'code' => 'SBC', 'city' => 'Bengaluru'],
            ['name' => 'MGR Chennai Central', 'code' => 'MAS', 'city' => 'Chennai'],
            ['name' => 'Chhatrapati Shivaji Terminus', 'code' => 'CSTM', 'city' => 'Mumbai'],
            ['name' => 'Lucknow Charbagh', 'code' => 'LKO', 'city' => 'Lucknow'],
            ['name' => 'Patna Junction', 'code' => 'PNBE', 'city' => 'Patna'],
            ['name' => 'Gorakhpur Junction', 'code' => 'GKP', 'city' => 'Gorakhpur'],
        ];

        $stations = [];
        foreach ($stationsData as $s) {
            $stations[$s['code']] = Station::create($s);
        }

        // 3. Create Trains
        $trainsData = [
            [
                'train_number' => '12301',
                'name' => 'Howrah Rajdhani Express',
                'type' => 'Rajdhani',
                'source_station_id' => $stations['NDLS']->id,
                'destination_station_id' => $stations['HWH']->id,
                'runs_on' => '1,2,3,4,5,6,7',
            ],
            [
                'train_number' => '12002',
                'name' => 'New Delhi Shatabdi Express',
                'type' => 'Shatabdi',
                'source_station_id' => $stations['NDLS']->id,
                'destination_station_id' => $stations['LKO']->id,
                'runs_on' => '1,2,3,4,5,6,7',
            ],
            [
                'train_number' => '22692',
                'name' => 'Hazrat Nizamuddin Bengaluru Rajdhani',
                'type' => 'Rajdhani',
                'source_station_id' => $stations['NDLS']->id,
                'destination_station_id' => $stations['SBC']->id,
                'runs_on' => '1,3,4,6',
            ],
            [
                'train_number' => '12626' ,
                'name' => 'Kerala Express',
                'type' => 'Superfast',
                'source_station_id' => $stations['NDLS']->id,
                'destination_station_id' => $stations['MAS']->id,
                'runs_on' => '1,2,3,4,5,6,7',
            ],
            [
                'train_number' => '12138',
                'name' => 'Punjab Mail',
                'type' => 'Express',
                'source_station_id' => $stations['CSTM']->id,
                'destination_station_id' => $stations['NDLS']->id,
                'runs_on' => '1,2,3,4,5,6,7',
            ],
        ];

        $trains = [];
        foreach ($trainsData as $t) {
            $trains[$t['train_number']] = Train::create($t);
        }

        // 4. Create Routes
        // Route for 12301: NDLS -> PNBE -> HWH
        Route::create([
            'train_id' => $trains['12301']->id,
            'station_id' => $stations['NDLS']->id,
            'stop_number' => 1,
            'arrival_time' => null,
            'departure_time' => '16:55:00',
            'distance_from_source' => 0,
            'fare_factor' => 1.00,
        ]);
        Route::create([
            'train_id' => $trains['12301']->id,
            'station_id' => $stations['PNBE']->id,
            'stop_number' => 2,
            'arrival_time' => '05:45:00',
            'departure_time' => '05:55:00',
            'distance_from_source' => 998,
            'fare_factor' => 1.20,
        ]);
        Route::create([
            'train_id' => $trains['12301']->id,
            'station_id' => $stations['HWH']->id,
            'stop_number' => 3,
            'arrival_time' => '12:15:00',
            'departure_time' => null,
            'distance_from_source' => 1450,
            'fare_factor' => 1.40,
        ]);

        // Route for 12002: NDLS -> GKP -> LKO
        Route::create([
            'train_id' => $trains['12002']->id,
            'station_id' => $stations['NDLS']->id,
            'stop_number' => 1,
            'arrival_time' => null,
            'departure_time' => '06:10:00',
            'distance_from_source' => 0,
            'fare_factor' => 1.00,
        ]);
        Route::create([
            'train_id' => $trains['12002']->id,
            'station_id' => $stations['GKP']->id,
            'stop_number' => 2,
            'arrival_time' => '10:20:00',
            'departure_time' => '10:30:00',
            'distance_from_source' => 410,
            'fare_factor' => 1.10,
        ]);
        Route::create([
            'train_id' => $trains['12002']->id,
            'station_id' => $stations['LKO']->id,
            'stop_number' => 3,
            'arrival_time' => '12:40:00',
            'departure_time' => null,
            'distance_from_source' => 512,
            'fare_factor' => 1.25,
        ]);

        // Route for 22692: NDLS -> SBC
        Route::create([
            'train_id' => $trains['22692']->id,
            'station_id' => $stations['NDLS']->id,
            'stop_number' => 1,
            'arrival_time' => null,
            'departure_time' => '19:50:00',
            'distance_from_source' => 0,
            'fare_factor' => 1.00,
        ]);
        Route::create([
            'train_id' => $trains['22692']->id,
            'station_id' => $stations['SBC']->id,
            'stop_number' => 2,
            'arrival_time' => '05:20:00',
            'departure_time' => null,
            'distance_from_source' => 2365,
            'fare_factor' => 1.50,
        ]);

        // Route for 12626: NDLS -> LKO -> MAS
        Route::create([
            'train_id' => $trains['12626']->id,
            'station_id' => $stations['NDLS']->id,
            'stop_number' => 1,
            'arrival_time' => null,
            'departure_time' => '20:10:00',
            'distance_from_source' => 0,
            'fare_factor' => 1.00,
        ]);
        Route::create([
            'train_id' => $trains['12626']->id,
            'station_id' => $stations['LKO']->id,
            'stop_number' => 2,
            'arrival_time' => '04:30:00',
            'departure_time' => '04:45:00',
            'distance_from_source' => 512,
            'fare_factor' => 1.20,
        ]);
        Route::create([
            'train_id' => $trains['12626']->id,
            'station_id' => $stations['MAS']->id,
            'stop_number' => 3,
            'arrival_time' => '22:50:00',
            'departure_time' => null,
            'distance_from_source' => 2182,
            'fare_factor' => 1.45,
        ]);

        // Route for 12138: CSTM -> NDLS
        Route::create([
            'train_id' => $trains['12138']->id,
            'station_id' => $stations['CSTM']->id,
            'stop_number' => 1,
            'arrival_time' => null,
            'departure_time' => '07:30:00',
            'distance_from_source' => 0,
            'fare_factor' => 1.00,
        ]);
        Route::create([
            'train_id' => $trains['12138']->id,
            'station_id' => $stations['NDLS']->id,
            'stop_number' => 2,
            'arrival_time' => '05:15:00',
            'departure_time' => null,
            'distance_from_source' => 1540,
            'fare_factor' => 1.30,
        ]);

        // 5. Create Coaches
        $coachClasses = [
            '1A' => ['prefix' => 'H', 'count' => 1, 'seats' => 24],
            '2A' => ['prefix' => 'A', 'count' => 2, 'seats' => 46],
            '3A' => ['prefix' => 'B', 'count' => 3, 'seats' => 64],
            'SL' => ['prefix' => 'S', 'count' => 4, 'seats' => 72],
            'CC' => ['prefix' => 'C', 'count' => 2, 'seats' => 60],
        ];

        foreach ($trains as $train) {
            foreach ($coachClasses as $class => $cfg) {
                // If it's a Rajdhani, skip CC (Chair Car), they usually don't have CC
                if ($train->type === 'Rajdhani' && $class === 'CC') continue;
                // If it's Shatabdi, skip SL and 1A, Shatabdi is CC and EC (2A equivalent)
                if ($train->type === 'Shatabdi' && in_array($class, ['SL', '1A'])) continue;

                for ($i = 1; $i <= $cfg['count']; $i++) {
                    Coach::create([
                        'train_id' => $train->id,
                        'coach_number' => $cfg['prefix'] . $i,
                        'class_type' => $class,
                        'total_seats' => $cfg['seats'],
                    ]);
                }
            }
        }

        // 6. Create Schedules (for next 15 days, starting from 2026-05-22)
        $schedules = [];
        $startDate = Carbon::create(2026, 5, 22);

        for ($d = 0; $d < 15; $d++) {
            $currentDate = $startDate->copy()->addDays($d);
            $dayOfWeek = $currentDate->dayOfWeek === 0 ? 7 : $currentDate->dayOfWeek; // 1=Mon, 7=Sun

            foreach ($trains as $train) {
                $runsOn = explode(',', $train->runs_on);
                if (in_array($dayOfWeek, $runsOn)) {
                    // Introduce a few delays/cancellations randomly
                    $status = 'Scheduled';
                    $delay = 0;
                    $rand = rand(1, 20);
                    if ($rand === 1) {
                        $status = 'Delayed';
                        $delay = rand(15, 120); // 15 to 120 mins delay
                    } elseif ($rand === 2) {
                        $status = 'Cancelled';
                    }

                    $schedules[] = Schedule::create([
                        'train_id' => $train->id,
                        'departure_date' => $currentDate->format('Y-m-d'),
                        'status' => $status,
                        'delay_minutes' => $delay,
                    ]);
                }
            }
        }

        // 7. Seed Simulated Bookings & Passengers
        // We will seed bookings on the first schedule (2026-05-22)
        $todaySchedules = collect($schedules)->filter(function($s) {
            return $s->departure_date === '2026-05-22' && $s->status === 'Scheduled';
        });

        $bookingCounter = 1;
        foreach ($todaySchedules as $schedule) {
            $train = $schedule->train;
            // Let's create some bookings for different classes
            $classes = ['1A', '2A', '3A', 'SL'];
            if ($train->type === 'Shatabdi') {
                $classes = ['CC', '2A'];
            }

            foreach ($classes as $class) {
                // Book 5-10 seats in each class to simulate real occupancy
                $coaches = Coach::where('train_id', $train->id)->where('class_type', $class)->get();
                if ($coaches->isEmpty()) continue;

                $numBookings = rand(1, 4);
                for ($b = 0; $b < $numBookings; $b++) {
                    $randomPassengerUser = $fakePassengers[array_rand($fakePassengers)];
                    $pnr = '4' . str_pad($bookingCounter . rand(100, 999), 9, '0', STR_PAD_LEFT);
                    
                    // Route endpoints
                    $source = Route::where('train_id', $train->id)->orderBy('stop_number', 'asc')->first();
                    $dest = Route::where('train_id', $train->id)->orderBy('stop_number', 'desc')->first();

                    $baseFare = 150.00;
                    if ($class === '1A') $baseFare = 1200.00;
                    elseif ($class === '2A') $baseFare = 800.00;
                    elseif ($class === '3A') $baseFare = 500.00;
                    elseif ($class === 'CC') $baseFare = 450.00;

                    $numPassengers = rand(1, 3);
                    $totalFare = $baseFare * $numPassengers * $dest->fare_factor;

                    $booking = Booking::create([
                        'user_id' => $randomPassengerUser->id,
                        'train_id' => $train->id,
                        'schedule_id' => $schedule->id,
                        'pnr' => $pnr,
                        'booking_date' => Carbon::create(2026, 5, 21, rand(9, 21), rand(1, 59)),
                        'journey_date' => '2026-05-22',
                        'source_station_id' => $source->station_id,
                        'destination_station_id' => $dest->station_id,
                        'class_type' => $class,
                        'total_fare' => $totalFare,
                        'status' => 'Booked',
                    ]);

                    // Create Payment
                    Payment::create([
                        'booking_id' => $booking->id,
                        'transaction_id' => 'TXN' . strtoupper(uniqid()),
                        'amount' => $totalFare,
                        'payment_status' => 'Success',
                        'payment_method' => ['UPI', 'Card', 'Net Banking'][rand(0, 2)],
                    ]);

                    // Assign seats
                    for ($p = 0; $p < $numPassengers; $p++) {
                        $coach = $coaches->random();
                        $seatNo = rand(1, $coach->total_seats);
                        
                        $passengerName = 'Passenger ' . rand(1, 100);
                        $age = rand(18, 65);
                        $gender = ['Male', 'Female'][rand(0, 1)];

                        $psg = Passenger::create([
                            'booking_id' => $booking->id,
                            'name' => $passengerName,
                            'age' => $age,
                            'gender' => $gender,
                            'coach_number' => $coach->coach_number,
                            'seat_number' => $seatNo,
                            'berth_preference' => ['Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper'][rand(0, 4)],
                            'status' => 'CNF',
                        ]);

                        Ticket::create([
                            'booking_id' => $booking->id,
                            'passenger_id' => $psg->id,
                            'ticket_number' => 'TKT' . str_pad($bookingCounter . $p . rand(100, 999), 10, '0', STR_PAD_LEFT),
                            'status' => 'Active',
                        ]);
                    }
                    $bookingCounter++;
                }
            }
        }

        // Create a direct booking for the main passenger user (Shivanshu) to test history
        $hwhRajdhani = $trains['12301'];
        $hwhSchedule = collect($schedules)->first(function($s) use ($hwhRajdhani) {
            return $s->train_id === $hwhRajdhani->id && $s->departure_date === '2026-05-24';
        });

        if ($hwhSchedule) {
            $myBooking = Booking::create([
                'user_id' => $passenger->id,
                'train_id' => $hwhRajdhani->id,
                'schedule_id' => $hwhSchedule->id,
                'pnr' => '9876543210',
                'booking_date' => Carbon::now(),
                'journey_date' => '2026-05-24',
                'source_station_id' => $stations['NDLS']->id,
                'destination_station_id' => $stations['HWH']->id,
                'class_type' => '3A',
                'total_fare' => 1750.00,
                'status' => 'Booked',
            ]);

            Payment::create([
                'booking_id' => $myBooking->id,
                'transaction_id' => 'TXN' . strtoupper(uniqid()),
                'amount' => 1750.00,
                'payment_status' => 'Success',
                'payment_method' => 'UPI',
            ]);

            $myPsg = Passenger::create([
                'booking_id' => $myBooking->id,
                'name' => 'Shivanshu Sharma',
                'age' => 24,
                'gender' => 'Male',
                'coach_number' => 'B1',
                'seat_number' => 7,
                'berth_preference' => 'Lower',
                'status' => 'CNF',
            ]);

            Ticket::create([
                'booking_id' => $myBooking->id,
                'passenger_id' => $myPsg->id,
                'ticket_number' => 'TKT1000000001',
                'status' => 'Active',
            ]);
        }

        // 8. Seed Complaints
        Complaint::create([
            'user_id' => $passenger->id,
            'booking_id' => isset($myBooking) ? $myBooking->id : null,
            'category' => 'Catering',
            'subject' => 'Cold meals served in B1 coach',
            'description' => 'I booked a meal via e-catering, but the rice and curry served were ice-cold and the container was partially leaking.',
            'status' => 'Resolved',
            'resolution_details' => 'Catering contractor was notified. A refund of Rs. 120 has been processed for the food charge, and the onboard coach team replaced the meal.',
        ]);

        Complaint::create([
            'user_id' => $passenger->id,
            'booking_id' => isset($myBooking) ? $myBooking->id : null,
            'category' => 'Cleanliness',
            'subject' => 'Washrooms in B1 coach dirty',
            'description' => 'The toilets in B1 coach do not have water and the trash bin is overflowing since departure from New Delhi.',
            'status' => 'Open',
        ]);

        Complaint::create([
            'user_id' => $fakePassengers[0]->id,
            'category' => 'Electrical',
            'subject' => 'Mobile charging port not working in S1 seat 25',
            'description' => 'The charging plug at seat 25 is loose and not supplying electricity. Please repair.',
            'status' => 'In Progress',
        ]);

        // 9. Seed Notifications
        Notification::create([
            'user_id' => $passenger->id,
            'type' => 'Booking',
            'title' => 'Ticket Booked Successfully!',
            'message' => 'Your ticket for Train 12301 - Howrah Rajdhani on 2026-05-24 has been booked successfully under PNR 9876543210. Coach: B1, Seat: 7 (CNF).',
            'read_status' => 'Read',
        ]);

        Notification::create([
            'user_id' => $passenger->id,
            'type' => 'Complaint',
            'title' => 'Complaint Resolved',
            'message' => 'Your complaint ticket regarding Cold meals served in B1 coach has been resolved. The refund has been initiated.',
            'read_status' => 'Unread',
        ]);

        // 10. Seed Meal Options
        $mealItems = [
            ['item_name' => 'North Indian Veg Thali', 'description' => 'Dal makhani, paneer, 2 roti, rice, sweet', 'price' => 150.00],
            ['item_name' => 'Chicken Biryani Combo', 'description' => 'Flavorful basmati rice with chicken, raita, salad', 'price' => 220.00],
            ['item_name' => 'South Indian Masala Dosa', 'description' => 'Crispy crepe with potato filling, sambar, chutney', 'price' => 110.00],
            ['item_name' => 'Kolkata Rosogolla Pack', 'description' => 'Box of 4 soft spongy syrup sweets', 'price' => 80.00],
            ['item_name' => 'Paneer Butter Masala Combo', 'description' => 'Creamy paneer gravy with 3 butter rotis or jeera rice', 'price' => 180.00],
        ];

        foreach (Station::all() as $station) {
            foreach ($mealItems as $item) {
                // Seed random subset for stations to make it realistic
                if (rand(0, 4) > 0) {
                    \App\Models\MealOption::create([
                        'station_id' => $station->id,
                        'item_name' => $item['item_name'],
                        'description' => $item['description'],
                        'price' => $item['price'],
                        'is_available' => true,
                    ]);
                }
            }
        }
    }
}
