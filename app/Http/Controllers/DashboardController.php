<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Complaint;
use App\Models\Train;
use App\Models\Schedule;
use App\Models\Payment;
use App\Models\Notification;
use App\Models\Station;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Handle the dashboard routing based on user roles (Admin vs Passenger).
     */
    public function index()
    {
        $user = Auth::user();

        if ($user->role === 'admin') {
            return $this->adminDashboard();
        }

        return $this->passengerDashboard($user);
    }

    /**
     * Fetch and render statistics for the passenger dashboard.
     */
    protected function passengerDashboard($user)
    {
        // 1. Get recent bookings with details
        $bookings = Booking::with(['train', 'sourceStation', 'destinationStation', 'passengers'])
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        // 2. Filter upcoming journeys (departure_date >= today)
        $today = date('Y-m-d');
        $upcomingBookings = Booking::with(['train', 'sourceStation', 'destinationStation', 'schedule'])
            ->where('user_id', $user->id)
            ->where('journey_date', '>=', $today)
            ->where('status', '!=', 'Cancelled')
            ->orderBy('journey_date', 'asc')
            ->get();

        // 3. User alerts/notifications
        $notifications = Notification::where('user_id', $user->id)
            ->latest()
            ->take(10)
            ->get();

        // 4. Quick status counters
        $stats = [
            'total_bookings' => $bookings->count(),
            'upcoming_trips' => $upcomingBookings->count(),
            'active_complaints' => Complaint::where('user_id', $user->id)
                ->whereIn('status', ['Open', 'In Progress'])
                ->count(),
        ];

        return Inertia::render('Dashboard', [
            'bookings' => $bookings,
            'upcoming' => $upcomingBookings,
            'notifications' => $notifications,
            'stats' => $stats,
        ]);
    }

    /**
     * Fetch and render analytics and management tools for the admin dashboard.
     */
    protected function adminDashboard()
    {
        // 1. Core counters
        $totalTrains = Train::count();
        $totalBookings = Booking::where('status', '!=', 'Cancelled')->count();
        
        $totalRevenue = Payment::where('payment_status', 'Success')->sum('amount') 
            - Payment::where('payment_status', 'Refunded')->sum('amount');

        $activeComplaintsCount = Complaint::whereIn('status', ['Open', 'In Progress'])->count();

        // 2. Revenue breakdown by month
        $driver = DB::connection()->getDriverName();
        if ($driver === 'pgsql') {
            $monthExpr = "TO_CHAR(created_at, 'Mon YYYY')";
        } elseif ($driver === 'sqlite') {
            $monthExpr = "strftime('%m-%Y', created_at)";
        } else {
            $monthExpr = "DATE_FORMAT(created_at, '%b %Y')";
        }

        $revenueData = Payment::select(
                DB::raw("$monthExpr as month"),
                DB::raw("SUM(CASE WHEN payment_status = 'Success' THEN amount ELSE 0 END) - SUM(CASE WHEN payment_status = 'Refunded' THEN amount ELSE 0 END) as net_revenue")
            )
            ->groupBy(DB::raw($monthExpr))
            ->orderBy(DB::raw("MIN(created_at)"), 'asc')
            ->take(6)
            ->get();

        // 3. Complaints breakdown by category and status
        $complaintsSummary = Complaint::select('category', DB::raw('count(*) as total'))
            ->groupBy('category')
            ->get();

        $complaintsList = Complaint::with(['user', 'booking'])
            ->latest()
            ->get();

        // 4. Train occupancy rates (Heatmap Data)
        // Group by schedules and calculate: capacity vs booked tickets
        $schedules = Schedule::with(['train.coaches', 'train.sourceStation', 'train.destinationStation'])
            ->where('departure_date', '>=', date('Y-m-d', strtotime('-7 days'))) // past 7 days to next 30 days
            ->orderBy('departure_date', 'asc')
            ->get();

        $occupancyHeatmap = [];
        foreach ($schedules as $schedule) {
            $train = $schedule->train;
            if (!$train) continue;

            // Total train seat capacity from coaches
            $totalCapacity = $train->coaches->sum('total_seats');

            // Count booked passengers on this schedule
            $bookedSeats = DB::table('passengers')
                ->join('bookings', 'passengers.booking_id', '=', 'bookings.id')
                ->where('bookings.schedule_id', $schedule->id)
                ->where('bookings.status', '!=', 'Cancelled')
                ->where('passengers.status', 'CNF') // Confirmed seats only for occupancy
                ->count();

            $occupancyRate = $totalCapacity > 0 ? round(($bookedSeats / $totalCapacity) * 100) : 0;

            // Class-wise details
            $classOccupancy = [];
            foreach ($train->coaches->groupBy('class_type') as $class => $coaches) {
                $classCapacity = $coaches->sum('total_seats');
                $classBooked = DB::table('passengers')
                    ->join('bookings', 'passengers.booking_id', '=', 'bookings.id')
                    ->where('bookings.schedule_id', $schedule->id)
                    ->where('bookings.status', '!=', 'Cancelled')
                    ->where('bookings.class_type', $class)
                    ->where('passengers.status', 'CNF')
                    ->count();

                $classOccupancy[$class] = [
                    'capacity' => $classCapacity,
                    'booked' => $classBooked,
                    'rate' => $classCapacity > 0 ? round(($classBooked / $classCapacity) * 100) : 0
                ];
            }

            $occupancyHeatmap[] = [
                'schedule_id' => $schedule->id,
                'train_number' => $train->train_number,
                'train_name' => $train->name,
                'departure_date' => $schedule->departure_date,
                'status' => $schedule->status,
                'total_capacity' => $totalCapacity,
                'booked_seats' => $bookedSeats,
                'occupancy_rate' => $occupancyRate,
                'class_occupancy' => $classOccupancy,
            ];
        }

        // 5. Trains and stations list for managers
        $trains = Train::with(['sourceStation', 'destinationStation', 'coaches'])->get();
        $stations = Station::orderBy('name', 'asc')->get();

        return Inertia::render('AdminDashboard', [
            'stats' => [
                'total_trains' => $totalTrains,
                'total_bookings' => $totalBookings,
                'total_revenue' => round($totalRevenue, 2),
                'active_complaints' => $activeComplaintsCount,
            ],
            'revenue_chart' => $revenueData,
            'complaints_summary' => $complaintsSummary,
            'complaints' => $complaintsList,
            'occupancy_heatmap' => $occupancyHeatmap,
            'trains' => $trains,
            'stations' => $stations,
        ]);
    }

    /**
     * Mark a notification as read.
     */
    public function readNotification($id)
    {
        $notification = Notification::where('user_id', Auth::id())->findOrFail($id);
        $notification->update(['read_status' => 'Read']);

        return redirect()->back()->with('success', 'Notification marked as read.');
    }

    /**
     * Manage Train schedule delays (Admin only).
     */
    public function updateScheduleDelay(Request $request, $id)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized.');
        }

        $request->validate([
            'status' => 'required|in:Scheduled,Delayed,Cancelled',
            'delay_minutes' => 'required|integer|min:0',
        ]);

        $schedule = Schedule::with('train')->findOrFail($id);
        $schedule->update([
            'status' => $request->status,
            'delay_minutes' => $request->delay_minutes,
        ]);

        // Send alert notification to all passengers booked on this schedule
        $bookings = Booking::where('schedule_id', $schedule->id)
            ->where('status', '!=', 'Cancelled')
            ->get();

        $message = $request->status === 'Cancelled' 
            ? "CRITICAL: Train {$schedule->train->train_number} - {$schedule->train->name} scheduled for {$schedule->departure_date} has been CANCELLED. A full refund will be processed automatically."
            : "Train {$schedule->train->train_number} - {$schedule->train->name} scheduled for {$schedule->departure_date} is running {$request->status} by {$request->delay_minutes} minutes.";

        foreach ($bookings as $booking) {
            Notification::create([
                'user_id' => $booking->user_id,
                'type' => 'Delay',
                'title' => "Train Schedule Update: " . $request->status,
                'message' => $message,
                'read_status' => 'Unread',
            ]);

            // If cancelled, trigger refund for booking automatically
            if ($request->status === 'Cancelled') {
                $booking->update(['status' => 'Cancelled']);
                
                // Refund payment
                $payment = Payment::where('booking_id', $booking->id)->where('payment_status', 'Success')->first();
                if ($payment) {
                    Payment::create([
                        'booking_id' => $booking->id,
                        'transaction_id' => 'REF-' . strtoupper(bin2hex(random_bytes(5))),
                        'amount' => $payment->amount,
                        'payment_status' => 'Refunded',
                        'payment_method' => $payment->payment_method,
                    ]);
                }

                // Free up seat assignment on passengers table
                DB::table('passengers')
                    ->where('booking_id', $booking->id)
                    ->update([
                        'coach_number' => null,
                        'seat_number' => null,
                        'status' => 'WL', // reset confirmation
                    ]);
            }
        }

        return redirect()->back()->with('success', 'Train schedule updated and passenger alerts sent.');
    }
}
