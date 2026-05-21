<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\CateringOrder;
use App\Models\MealOption;
use App\Models\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CateringController extends Controller
{
    /**
     * Show catering menu catalog for stops on a PNR journey
     */
    public function catalog(Request $request, $pnr)
    {
        $booking = Booking::with(['train', 'sourceStation', 'destinationStation'])
            ->where('pnr', $pnr)
            ->firstOrFail();

        // Ensure user is authorized (either owner, admin, or agent who booked it)
        if (Auth::user()->role !== 'admin' && $booking->user_id !== Auth::id()) {
            abort(403, 'Unauthorized.');
        }

        // Find stops between source and destination of booking
        $sourceRoute = Route::where('train_id', $booking->train_id)
            ->where('station_id', $booking->source_station_id)
            ->firstOrFail();

        $destRoute = Route::where('train_id', $booking->train_id)
            ->where('station_id', $booking->destination_station_id)
            ->firstOrFail();

        $stationIds = Route::where('train_id', $booking->train_id)
            ->where('stop_number', '>=', $sourceRoute->stop_number)
            ->where('stop_number', '<=', $destRoute->stop_number)
            ->pluck('station_id');

        // Fetch available meals for these stations
        $mealOptions = MealOption::with('station')
            ->whereIn('station_id', $stationIds)
            ->where('is_available', true)
            ->get()
            ->groupBy('station_id');

        // Map station ID to station names and menus
        $stationsWithMeals = [];
        foreach ($mealOptions as $stationId => $meals) {
            $station = $meals->first()->station;
            $stationsWithMeals[] = [
                'station_id' => $stationId,
                'station_name' => $station->name,
                'station_code' => $station->code,
                'meals' => $meals,
            ];
        }

        // Get existing catering orders for this booking
        $existingOrders = CateringOrder::with('station')
            ->where('booking_id', $booking->id)
            ->latest()
            ->get();

        return Inertia::render('CateringCatalog', [
            'booking' => $booking,
            'stationsWithMeals' => $stationsWithMeals,
            'existingOrders' => $existingOrders,
        ]);
    }

    /**
     * Order a meal
     */
    public function order(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'station_id' => 'required|exists:stations,id',
            'items' => 'required|array',
            'items.*.item_id' => 'required|exists:meal_options,id',
            'items.*.item_name' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric',
            'total_price' => 'required|numeric',
        ]);

        $booking = Booking::findOrFail($request->booking_id);

        // Ensure user is authorized
        if (Auth::user()->role !== 'admin' && $booking->user_id !== Auth::id()) {
            abort(403, 'Unauthorized.');
        }

        $user = Auth::user();
        $totalPrice = (float) $request->total_price;

        \DB::transaction(function () use ($request, $booking, $user, $totalPrice) {
            // If user is an agent, deduct from wallet
            if ($user->role === 'agent') {
                if ($user->wallet_balance < $totalPrice) {
                    throw new \Exception('Insufficient wallet balance for this meal order.');
                }
                $user->decrement('wallet_balance', $totalPrice);

                // Log wallet transaction
                \App\Models\WalletTransaction::create([
                    'user_id' => $user->id,
                    'amount' => $totalPrice,
                    'type' => 'Debit',
                    'description' => "E-Catering Meal Order for PNR: {$booking->pnr}",
                ]);
            }

            // Create Catering Order
            CateringOrder::create([
                'booking_id' => $request->booking_id,
                'station_id' => $request->station_id,
                'item_details' => $request->items,
                'total_price' => $totalPrice,
                'payment_status' => 'Success',
                'delivery_status' => 'Placed',
            ]);
        });

        return redirect()->back()->with('success', 'Meal order placed successfully!');
    }
}
