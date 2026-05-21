<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Passenger;
use App\Models\Ticket;
use App\Models\Payment;
use App\Models\Train;
use App\Models\Schedule;
use App\Models\Coach;
use App\Models\Route;
use App\Models\Notification;
use App\Models\Station;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class BookingController extends Controller
{
    /**
     * Show booking history for passenger
     */
    public function index()
    {
        $user = Auth::user();
        $bookings = Booking::with(['train', 'schedule', 'sourceStation', 'destinationStation', 'passengers.ticket'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Dashboard', [
            'bookings' => $bookings,
            'notifications' => $notifications,
        ]);
    }

    /**
     * Show booking details (PNR Enquiry)
     */
    public function show($pnr)
    {
        $booking = Booking::with(['train', 'schedule', 'sourceStation', 'destinationStation', 'passengers.ticket', 'payment'])
            ->where('pnr', $pnr)
            ->firstOrFail();

        // Check permission: either the booking owner or an admin
        if ($booking->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            abort(403);
        }

        return Inertia::render('TicketConfirmation', [
            'booking' => $booking,
        ]);
    }

    /**
     * Show Booking Form
     */
    public function createForm(Request $request)
    {
        $request->validate([
            'train_id' => 'required|exists:trains,id',
            'schedule_id' => 'required|exists:schedules,id',
            'class_type' => 'required|string',
            'source' => 'required|exists:stations,code',
            'destination' => 'required|exists:stations,code',
        ]);

        $train = Train::findOrFail($request->train_id);
        $schedule = Schedule::findOrFail($request->schedule_id);
        $source = Station::where('code', $request->source)->firstOrFail();
        $destination = Station::where('code', $request->destination)->firstOrFail();

        // Calculate dynamic fare
        $sourceRoute = Route::where('train_id', $train->id)->where('station_id', $source->id)->first();
        $destRoute = Route::where('train_id', $train->id)->where('station_id', $destination->id)->first();
        
        $fareFactor = $destRoute->fare_factor - $sourceRoute->fare_factor;
        if ($fareFactor <= 0) $fareFactor = 1.00;

        $baseFare = 150.00;
        $class = $request->class_type;
        if ($class === '1A') $baseFare = 1200.00;
        elseif ($class === '2A') $baseFare = 800.00;
        elseif ($class === '3A') $baseFare = 500.00;
        elseif ($class === 'CC') $baseFare = 450.00;

        $farePerPassenger = round($baseFare * $fareFactor, 2);

        return Inertia::render('Booking', [
            'train' => $train,
            'schedule' => $schedule,
            'class_type' => $class,
            'source' => $source,
            'destination' => $destination,
            'fare_per_passenger' => $farePerPassenger,
        ]);
    }

    /**
     * Store a Booking (Initial state: Pending payment)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'train_id' => 'required|exists:trains,id',
            'schedule_id' => 'required|exists:schedules,id',
            'class_type' => 'required|in:SL,3A,2A,1A,CC',
            'source_station_id' => 'required|exists:stations,id',
            'destination_station_id' => 'required|exists:stations,id',
            'passengers' => 'required|array|min:1|max:6',
            'passengers.*.name' => 'required|string|max:100',
            'passengers.*.age' => 'required|integer|min:1|max:120',
            'passengers.*.gender' => 'required|in:Male,Female,Other',
            'passengers.*.berth_preference' => 'nullable|string',
            'passengers.*.coach_number' => 'nullable|string',
            'passengers.*.seat_number' => 'nullable|integer',
            'total_fare' => 'required|numeric',
        ]);

        // Validate seat map selection if provided
        $occupied = $this->getOccupiedSeats($validated['schedule_id'], $validated['class_type']);
        foreach ($validated['passengers'] as $psg) {
            if (!empty($psg['coach_number']) && !empty($psg['seat_number'])) {
                $coach = $psg['coach_number'];
                $seat = (int) $psg['seat_number'];
                if (isset($occupied[$coach]) && in_array($seat, $occupied[$coach])) {
                    return redirect()->back()->withErrors(['error' => "Seat {$coach}-{$seat} is already occupied or locked by another passenger. Please select a different seat."]);
                }
            }
        }

        $pnr = '4' . str_pad(rand(0, 999999999), 9, '0', STR_PAD_LEFT);

        DB::beginTransaction();
        try {
            $booking = Booking::create([
                'user_id' => Auth::id(),
                'train_id' => $validated['train_id'],
                'schedule_id' => $validated['schedule_id'],
                'pnr' => $pnr,
                'booking_date' => now(),
                'journey_date' => Schedule::findOrFail($validated['schedule_id'])->departure_date,
                'source_station_id' => $validated['source_station_id'],
                'destination_station_id' => $validated['destination_station_id'],
                'class_type' => $validated['class_type'],
                'total_fare' => $validated['total_fare'],
                'status' => 'Pending',
            ]);

            // Create initial pending payment
            $payment = Payment::create([
                'booking_id' => $booking->id,
                'transaction_id' => 'TXN' . strtoupper(uniqid()),
                'amount' => $validated['total_fare'],
                'payment_status' => 'Pending',
                'payment_method' => 'UPI',
            ]);

            // Create pending passengers
            foreach ($validated['passengers'] as $psg) {
                $hasCustomSeat = !empty($psg['coach_number']) && !empty($psg['seat_number']);
                Passenger::create([
                    'booking_id' => $booking->id,
                    'name' => $psg['name'],
                    'age' => $psg['age'],
                    'gender' => $psg['gender'],
                    'berth_preference' => $psg['berth_preference'] ?? null,
                    'coach_number' => $psg['coach_number'] ?? null,
                    'seat_number' => $psg['seat_number'] ?? null,
                    'status' => $hasCustomSeat ? 'CNF' : 'WL', // Confirmed if pre-selected seat, else WL (reallocated on payment)
                ]);
            }

            DB::commit();

            return redirect()->route('payment.show', ['booking' => $booking->id]);
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Booking failed: ' . $e->getMessage()]);
        }
    }

    /**
     * Show Payment Page
     */
    public function showPayment(Booking $booking)
    {
        if ($booking->user_id !== Auth::id()) abort(403);
        $booking->load(['train', 'sourceStation', 'destinationStation', 'payment']);

        return Inertia::render('Payment', [
            'booking' => $booking,
        ]);
    }

    /**
     * Process simulated payment
     */
    public function processPayment(Request $request, Booking $booking)
    {
        if ($booking->user_id !== Auth::id()) abort(403);

        $request->validate([
            'payment_status' => 'required|in:Success,Failed',
            'payment_method' => 'required|string',
        ]);

        if ($request->payment_status === 'Failed') {
            DB::transaction(function () use ($booking) {
                $booking->update(['status' => 'Cancelled']);
                $booking->payment->update(['payment_status' => 'Failed']);
            });
            return redirect()->route('dashboard')->with('error', 'Payment failed. Reservation cancelled.');
        }

        // Handle Success: Lock tables and allocate seats!
        DB::beginTransaction();
        try {
            // Process Agent wallet balance if paying via Wallet
            $user = Auth::user();
            if ($request->payment_method === 'Wallet' && $user->role === 'agent') {
                if ($user->wallet_balance < $booking->total_fare) {
                    throw new \Exception('Insufficient wallet balance.');
                }
                
                // Debit wallet
                $user->decrement('wallet_balance', $booking->total_fare);
                
                // Log transaction
                WalletTransaction::create([
                    'user_id' => $user->id,
                    'amount' => $booking->total_fare,
                    'type' => 'Debit',
                    'description' => "Ticket Booking for PNR: {$booking->pnr}",
                ]);

                // Credit 2% commission cashback
                $commission = round($booking->total_fare * 0.02, 2);
                if ($commission > 0) {
                    $user->increment('wallet_balance', $commission);
                    WalletTransaction::create([
                        'user_id' => $user->id,
                        'amount' => $commission,
                        'type' => 'Credit',
                        'description' => "2% Booking Commission Cashback for PNR: {$booking->pnr}",
                    ]);
                }
            }

            // Lock coaches & bookings on this schedule to prevent race conditions (Pessimistic Seat Locking)
            $schedule = Schedule::where('id', $booking->schedule_id)->lockForUpdate()->first();
            $coaches = Coach::where('train_id', $booking->train_id)
                ->where('class_type', $booking->class_type)
                ->get();

            $totalSeats = $coaches->sum('total_seats');

            // Find all occupied seats excluding current booking
            $occupiedSeats = Passenger::whereHas('booking', function ($q) use ($booking) {
                $q->where('schedule_id', $booking->schedule_id)
                  ->where('class_type', $booking->class_type)
                  ->where('id', '!=', $booking->id)
                  ->where(function ($query) {
                      $query->whereIn('status', ['Booked', 'Partial'])
                            ->orWhere(function ($sub) {
                                $sub->where('status', 'Pending')
                                    ->where('created_at', '>=', now()->subMinutes(5));
                            });
                  });
            })
            ->whereNotNull('coach_number')
            ->whereNotNull('seat_number')
            ->get(['coach_number', 'seat_number'])
            ->groupBy('coach_number')
            ->map(function ($items) {
                return $items->pluck('seat_number')->toArray();
            })->toArray();

            $passengers = $booking->passengers;
            $assignedPassengers = [];
            $localRacCount = 0;
            $localWlCount = 0;

            foreach ($passengers as $passenger) {
                $allocated = false;

                // Detect selected seat inputs (keep them if vacant; auto-allocate otherwise)
                if (!empty($passenger->coach_number) && !empty($passenger->seat_number)) {
                    $cNum = $passenger->coach_number;
                    $sNum = (int)$passenger->seat_number;
                    $coachOccupied = $occupiedSeats[$cNum] ?? [];
                    if (!in_array($sNum, $coachOccupied)) {
                        // Keep it!
                        $passenger->update([
                            'status' => 'CNF',
                            'coach_number' => $cNum,
                            'seat_number' => $sNum,
                        ]);
                        $occupiedSeats[$cNum][] = $sNum;
                        $allocated = true;
                    }
                }

                if (!$allocated) {
                    // Try to find seat in one of the coaches
                    foreach ($coaches as $coach) {
                        $coachOccupied = $occupiedSeats[$coach->coach_number] ?? [];
                        
                        // Generate list of vacant seat numbers in this coach
                        $vacantSeats = array_diff(range(1, $coach->total_seats), $coachOccupied);

                        if (empty($vacantSeats)) continue;

                        // Match berth preference if specified
                        $pref = $passenger->berth_preference;
                        $bestSeat = null;

                        if ($pref) {
                            foreach ($vacantSeats as $seat) {
                                if ($this->getBerthType($seat, $booking->class_type) === $pref) {
                                    $bestSeat = $seat;
                                    break;
                                }
                            }
                        }

                        // Fallback to any vacant seat if preference not found
                        if (!$bestSeat) {
                            $bestSeat = reset($vacantSeats);
                        }

                        if ($bestSeat) {
                            // Mark as Confirmed (CNF)
                            $passenger->update([
                                'status' => 'CNF',
                                'coach_number' => $coach->coach_number,
                                'seat_number' => $bestSeat,
                            ]);
                            
                            // Add to occupied list locally for next passengers in this loop
                            $occupiedSeats[$coach->coach_number][] = $bestSeat;
                            $allocated = true;
                            break;
                        }
                    }
                }

                // If no CNF seat is available, assign RAC
                if (!$allocated) {
                    // Count current RAC bookings
                    $racCount = Passenger::whereHas('booking', function ($q) use ($booking) {
                        $q->where('schedule_id', $booking->schedule_id)
                          ->where('class_type', $booking->class_type)
                          ->whereIn('status', ['Booked', 'Partial']);
                    })->where('status', 'RAC')->count() + $localRacCount;

                    $racCapacity = 10;
                    if ($racCount < $racCapacity) {
                        $passenger->update([
                            'status' => 'RAC',
                            'coach_number' => 'RAC',
                            'seat_number' => $racCount + 1,
                        ]);
                        $localRacCount++;
                        $allocated = true;
                    }
                }

                // If no RAC is available, assign WL
                if (!$allocated) {
                    $wlCount = Passenger::whereHas('booking', function ($q) use ($booking) {
                        $q->where('schedule_id', $booking->schedule_id)
                          ->where('class_type', $booking->class_type)
                          ->whereIn('status', ['Booked', 'Partial']);
                    })->where('status', 'WL')->count() + $localWlCount;

                    $passenger->update([
                        'status' => 'WL',
                        'coach_number' => null,
                        'seat_number' => null,
                        'wl_number' => $wlCount + 1,
                    ]);
                    $localWlCount++;
                }

                // Generate Ticket
                $tktNo = 'TKT' . str_pad($booking->id . $passenger->id . rand(100, 999), 10, '0', STR_PAD_LEFT);
                Ticket::create([
                    'booking_id' => $booking->id,
                    'passenger_id' => $passenger->id,
                    'ticket_number' => $tktNo,
                    'status' => 'Active',
                ]);
            }

            // Update booking status and payment status
            $booking->update(['status' => 'Booked']);
            $booking->payment->update([
                'payment_status' => 'Success',
                'payment_method' => $request->payment_method,
            ]);

            // Add notification
            Notification::create([
                'user_id' => Auth::id(),
                'type' => 'Booking',
                'title' => 'Ticket Booked Successfully!',
                'message' => "Your journey on Train {$booking->train->train_number} - {$booking->train->name} on {$booking->journey_date} is confirmed under PNR {$booking->pnr}.",
            ]);

            DB::commit();
            return redirect()->route('booking.show', ['pnr' => $booking->pnr])->with('success', 'Booking Confirmed!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('dashboard')->with('error', 'Booking allocation failed: ' . $e->getMessage());
        }
    }

    /**
     * Cancel tickets
     */
    public function cancel(Request $request, Booking $booking)
    {
        if ($booking->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            abort(403);
        }

        $request->validate([
            'passengers' => 'required|array|min:1',
            'passengers.*' => 'exists:passengers,id',
        ]);

        $passengerIds = $request->passengers;

        DB::beginTransaction();
        try {
            $passengersToCancel = Passenger::whereIn('id', $passengerIds)
                ->where('booking_id', $booking->id)
                ->where('status', '!=', 'CANCELLED') // Avoid double cancellation
                ->get();

            if ($passengersToCancel->isEmpty()) {
                return redirect()->back()->withErrors(['error' => 'No active passengers found to cancel.']);
            }

            // Calculate refund percentage based on time left
            $depDate = Carbon::parse($booking->journey_date);
            // Get source departure time to compute precise cancel timing
            $sourceRoute = Route::where('train_id', $booking->train_id)->orderBy('stop_number')->first();
            $depTime = $sourceRoute ? $sourceRoute->departure_time : '00:00:00';
            $depDateTime = Carbon::parse($booking->journey_date . ' ' . $depTime);
            $hoursLeft = now()->diffInHours($depDateTime, false);

            $refundPercent = 0.00;
            if ($hoursLeft > 48) {
                $refundPercent = 0.80; // 80% refund
            } elseif ($hoursLeft >= 12) {
                $refundPercent = 0.50; // 50% refund
            } else {
                $refundPercent = 0.00; // 0% refund
            }

            $refundAmount = 0.00;
            $baseFarePerPassenger = $booking->total_fare / $booking->passengers->count();

            foreach ($passengersToCancel as $psg) {
                // Keep record of seat details to free them
                $freedCoach = $psg->coach_number;
                $freedSeat = $psg->seat_number;
                $wasConfirmed = ($psg->status === 'CNF');

                $psg->update([
                    'status' => 'CANCELLED',
                    'coach_number' => null,
                    'seat_number' => null,
                ]);

                // Update ticket status
                Ticket::where('passenger_id', $psg->id)->update(['status' => 'Cancelled']);

                $refundAmount += round($baseFarePerPassenger * $refundPercent, 2);

                // If passenger was confirmed, run RAC/WL promotion algorithm
                if ($wasConfirmed && $freedCoach && $freedSeat) {
                    $this->promoteQueue($booking->schedule_id, $booking->class_type, $freedCoach, $freedSeat);
                }
            }

            // Record Refund Payment
            if ($refundAmount > 0) {
                Payment::create([
                    'booking_id' => $booking->id,
                    'transaction_id' => 'REF' . strtoupper(uniqid()),
                    'amount' => $refundAmount,
                    'payment_status' => 'Refunded',
                    'payment_method' => $booking->payment->payment_method,
                ]);
            }

            // Check if all passengers are cancelled, update booking status
            $activeCount = Passenger::where('booking_id', $booking->id)->where('status', '!=', 'CANCELLED')->count();
            if ($activeCount === 0) {
                $booking->update(['status' => 'Cancelled']);
            } else {
                $booking->update(['status' => 'Partial']);
            }

            // Notification
            Notification::create([
                'user_id' => $booking->user_id,
                'type' => 'Cancellation',
                'title' => 'Tickets Cancelled',
                'message' => "Your cancellation request for PNR {$booking->pnr} was processed. Refund amount of Rs. {$refundAmount} has been initiated.",
            ]);

            DB::commit();
            return redirect()->route('dashboard')->with('success', 'Tickets cancelled successfully. Refund initiated.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Cancellation failed: ' . $e->getMessage()]);
        }
    }

    /**
     * Promotes RAC and WL passengers when a CNF seat is freed
     */
    private function promoteQueue($scheduleId, $classType, $freedCoach, $freedSeat)
    {
        // 1. Find the first RAC passenger on this schedule & class
        $firstRac = Passenger::whereHas('booking', function ($q) use ($scheduleId, $classType) {
            $q->where('schedule_id', $scheduleId)
              ->where('class_type', $classType)
              ->whereIn('status', ['Booked', 'Partial']);
        })->where('status', 'RAC')
          ->orderBy('seat_number', 'asc') // RAC seat number represents queue order
          ->first();

        if ($firstRac) {
            // Promote this RAC passenger to CNF and assign the freed seat
            $firstRac->update([
                'status' => 'CNF',
                'coach_number' => $freedCoach,
                'seat_number' => $freedSeat,
            ]);

            // Shift remaining RAC seats up
            $remainingRac = Passenger::whereHas('booking', function ($q) use ($scheduleId, $classType) {
                $q->where('schedule_id', $scheduleId)
                  ->where('class_type', $classType)
                  ->whereIn('status', ['Booked', 'Partial']);
            })->where('status', 'RAC')
              ->orderBy('seat_number', 'asc')
              ->get();

            $racIndex = 1;
            foreach ($remainingRac as $rac) {
                $rac->update(['seat_number' => $racIndex++]);
            }

            // Promote the first WL passenger to RAC (fill the empty RAC slot)
            $firstWl = Passenger::whereHas('booking', function ($q) use ($scheduleId, $classType) {
                $q->where('schedule_id', $scheduleId)
                  ->where('class_type', $classType)
                  ->whereIn('status', ['Booked', 'Partial']);
            })->where('status', 'WL')
              ->orderBy('wl_number', 'asc')
              ->first();

            if ($firstWl) {
                $firstWl->update([
                    'status' => 'RAC',
                    'coach_number' => 'RAC',
                    'seat_number' => $racIndex, // Put them at the end of the RAC queue
                    'wl_number' => null,
                ]);

                // Shift remaining WL queue up
                $remainingWl = Passenger::whereHas('booking', function ($q) use ($scheduleId, $classType) {
                    $q->where('schedule_id', $scheduleId)
                      ->where('class_type', $classType)
                      ->whereIn('status', ['Booked', 'Partial']);
                })->where('status', 'WL')
                  ->orderBy('wl_number', 'asc')
                  ->get();

                $wlIndex = 1;
                foreach ($remainingWl as $wl) {
                    $wl->update(['wl_number' => $wlIndex++]);
                }
            }
        } else {
            // If no RAC, check if there is any direct WL passenger to promote directly to CNF
            $firstWl = Passenger::whereHas('booking', function ($q) use ($scheduleId, $classType) {
                $q->where('schedule_id', $scheduleId)
                  ->where('class_type', $classType)
                  ->whereIn('status', ['Booked', 'Partial']);
            })->where('status', 'WL')
              ->orderBy('wl_number', 'asc')
              ->first();

            if ($firstWl) {
                $firstWl->update([
                    'status' => 'CNF',
                    'coach_number' => $freedCoach,
                    'seat_number' => $freedSeat,
                    'wl_number' => null,
                ]);

                // Shift remaining WL queue up
                $remainingWl = Passenger::whereHas('booking', function ($q) use ($scheduleId, $classType) {
                    $q->where('schedule_id', $scheduleId)
                      ->where('class_type', $classType)
                      ->whereIn('status', ['Booked', 'Partial']);
                })->where('status', 'WL')
                  ->orderBy('wl_number', 'asc')
                  ->get();

                $wlIndex = 1;
                foreach ($remainingWl as $wl) {
                    $wl->update(['wl_number' => $wlIndex++]);
                }
            }
        }
    }

    /**
     * Determines Berth Preference (Lower, Middle, Upper, etc.) based on seat number
     */
    private function getBerthType($seatNo, $classType)
    {
        if ($classType === 'SL' || $classType === '3A') {
            $mod = $seatNo % 8;
            if ($mod === 1 || $mod === 4) return 'Lower';
            if ($mod === 2 || $mod === 5) return 'Middle';
            if ($mod === 3 || $mod === 6) return 'Upper';
            if ($mod === 7) return 'Side Lower';
            return 'Side Upper'; // 0
        } elseif ($classType === '2A') {
            $mod = $seatNo % 6;
            if ($mod === 1 || $mod === 3) return 'Lower';
            if ($mod === 2 || $mod === 4) return 'Upper';
            if ($mod === 5) return 'Side Lower';
            return 'Side Upper'; // 0
        } elseif ($classType === '1A') {
            return ($seatNo % 2 === 1) ? 'Lower' : 'Upper';
        } elseif ($classType === 'CC') {
            $mod = $seatNo % 6;
            if ($mod === 1 || $mod === 0) return 'Window';
            if ($mod === 2 || $mod === 5) return 'Aisle';
            return 'Middle';
        }
        return 'Lower';
    }

    /**
     * Fetch occupied seat mapping for a schedule and class type.
     */
    public function getOccupiedSeats($scheduleId, $classType)
    {
        $occupied = Passenger::whereHas('booking', function ($q) use ($scheduleId, $classType) {
            $q->where('schedule_id', $scheduleId)
              ->where('class_type', $classType)
              ->where(function ($query) {
                  $query->whereIn('status', ['Booked', 'Partial'])
                        ->orWhere(function ($sub) {
                            $sub->where('status', 'Pending')
                                ->where('created_at', '>=', now()->subMinutes(5));
                        });
              });
        })
        ->whereNotNull('coach_number')
        ->whereNotNull('seat_number')
        ->get(['coach_number', 'seat_number'])
        ->groupBy('coach_number')
        ->map(function ($items) {
            return $items->pluck('seat_number')->toArray();
        })
        ->toArray();

        return $occupied;
    }

    /**
     * API Endpoint for fetching occupied seats
     */
    public function getOccupiedSeatsApi(Request $request)
    {
        $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
            'class_type' => 'required|string',
        ]);
        
        $schedule = Schedule::findOrFail($request->schedule_id);
        $coaches = Coach::where('train_id', $schedule->train_id)
            ->where('class_type', $request->class_type)
            ->get(['coach_number', 'total_seats']);

        $occupied = $this->getOccupiedSeats($request->schedule_id, $request->class_type);
        return response()->json([
            'coaches' => $coaches,
            'occupied' => $occupied
        ]);
    }

    /**
     * Render Public PNR Search page.
     */
    public function pnrLookupPage()
    {
        return Inertia::render('PnrChecker');
    }

    /**
     * Handle Public PNR Search API query.
     */
    public function pnrLookupApi(Request $request)
    {
        $request->validate([
            'pnr' => 'required|string|size:10',
        ]);

        $booking = Booking::with(['train', 'sourceStation', 'destinationStation', 'passengers.ticket'])
            ->where('pnr', $request->pnr)
            ->first();

        if (!$booking) {
            return response()->json(['error' => 'PNR not found.'], 404);
        }

        $delayMinutes = 0;
        if ($booking->schedule) {
            $delayMinutes = $booking->schedule->delay_minutes;
        }

        return response()->json([
            'booking' => $booking,
            'delay_minutes' => $delayMinutes,
        ]);
    }
}
