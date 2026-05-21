<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AgentController extends Controller
{
    /**
     * Render the Agent Dashboard.
     */
    public function index()
    {
        $user = Auth::user();

        if ($user->role !== 'agent') {
            abort(403, 'Unauthorized.');
        }

        // Get latest wallet transactions
        $transactions = WalletTransaction::where('user_id', $user->id)
            ->latest()
            ->take(15)
            ->get();

        // Get bookings made by this agent
        $bookings = Booking::with(['train', 'sourceStation', 'destinationStation', 'passengers'])
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        // Stats calculations
        $stats = [
            'wallet_balance' => $user->wallet_balance,
            'total_bookings' => $bookings->count(),
            'total_spent' => $transactions->where('type', 'Debit')->sum('amount'),
            'total_commission' => $transactions->where('type', 'Credit')
                ->filter(fn($t) => str_contains($t->description, 'Commission'))
                ->sum('amount'),
        ];

        return Inertia::render('AgentDashboard', [
            'stats' => $stats,
            'transactions' => $transactions,
            'bookings' => $bookings,
        ]);
    }

    /**
     * Top-up the agent's wallet.
     */
    public function deposit(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'agent') {
            abort(403, 'Unauthorized.');
        }

        $request->validate([
            'amount' => 'required|numeric|min:100|max:50000',
        ]);

        $amount = (float) $request->amount;

        \DB::transaction(function () use ($user, $amount) {
            // Update balance
            $user->increment('wallet_balance', $amount);

            // Log transaction
            WalletTransaction::create([
                'user_id' => $user->id,
                'amount' => $amount,
                'type' => 'Credit',
                'description' => 'Wallet Top-Up (Simulated)',
            ]);
        });

        return redirect()->back()->with('success', 'Wallet topped up successfully!');
    }
}
