<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use App\Models\Booking;
use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ComplaintController extends Controller
{
    /**
     * Display the complaint submission and tracking page for passengers.
     */
    public function index()
    {
        $user = Auth::user();

        // Get user's complaints
        $complaints = Complaint::with('booking.train')
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        // Get user's active/completed bookings for dropdown selection
        $bookings = Booking::with('train')
            ->where('user_id', $user->id)
            ->whereIn('status', ['Booked', 'Partial'])
            ->latest()
            ->get();

        // Fetch notifications
        $notifications = Notification::where('user_id', $user->id)
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('ComplaintCenter', [
            'complaints' => $complaints,
            'bookings' => $bookings,
            'notifications' => $notifications,
        ]);
    }

    /**
     * Store a passenger's complaint in the database.
     */
    public function store(Request $request)
    {
        $request->validate([
            'booking_id' => 'nullable|exists:bookings,id',
            'category' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        $complaint = Complaint::create([
            'user_id' => Auth::id(),
            'booking_id' => $request->booking_id,
            'category' => $request->category,
            'subject' => $request->subject,
            'description' => $request->description,
            'status' => 'Open',
        ]);

        // Create user notification
        Notification::create([
            'user_id' => Auth::id(),
            'type' => 'Complaint',
            'title' => 'Complaint Registered Successfully',
            'message' => "Your grievance regarding '{$request->subject}' has been registered. Reference Ticket: #C-{$complaint->id}.",
            'read_status' => 'Unread',
        ]);

        return redirect()->back()->with('success', 'Your complaint has been successfully submitted. Reference Ticket ID: #C-' . $complaint->id);
    }

    /**
     * Trigger an emergency SOS response.
     */
    public function sos(Request $request)
    {
        $request->validate([
            'booking_id' => 'nullable|exists:bookings,id',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'details' => 'nullable|string',
        ]);

        $user = Auth::user();
        
        // Simulating the nearest station finding
        $stations = [
            ['name' => 'New Delhi (NDLS)', 'lat' => 28.6430, 'lng' => 77.2223],
            ['name' => 'Howrah Junction (HWH)', 'lat' => 22.5830, 'lng' => 88.3431],
            ['name' => 'KSR Bengaluru (SBC)', 'lat' => 12.9781, 'lng' => 77.5697],
            ['name' => 'MGR Chennai Central (MAS)', 'lat' => 13.0825, 'lng' => 80.2750],
            ['name' => 'Chhatrapati Shivaji Terminal (CSMT)', 'lat' => 18.9402, 'lng' => 72.8354],
        ];

        // Find closest mock station using simple distance formula
        $closestStation = $stations[0]['name'];
        $minDist = 9999999;
        foreach ($stations as $station) {
            $dist = sqrt(pow($station['lat'] - $request->latitude, 2) + pow($station['lng'] - $request->longitude, 2));
            if ($dist < $minDist) {
                $minDist = $dist;
                $closestStation = $station['name'];
            }
        }

        $subject = "EMERGENCY SOS ALERT";
        $description = "URGENT ASSISTANCE REQUIRED! Coordinates: [{$request->latitude}, {$request->longitude}]. Nearest Station Control: {$closestStation}. Passenger details: {$user->name} (Email: {$user->email}). Info: " . ($request->details ?? 'Medical/Security assistance needed immediately.');

        $complaint = Complaint::create([
            'user_id' => $user->id,
            'booking_id' => $request->booking_id,
            'category' => 'SOS',
            'subject' => $subject,
            'description' => $description,
            'status' => 'In Progress', // High priority gets addressed immediately
        ]);

        // Create emergency notification for the passenger
        Notification::create([
            'user_id' => $user->id,
            'type' => 'SOS',
            'title' => 'SOS Alert Broadcasted!',
            'message' => "SOS received at {$closestStation} Station Control Room. RPF Security and Medical team have been dispatched. Emergency Ticket ID: #SOS-{$complaint->id}.",
            'read_status' => 'Unread',
        ]);

        // Simulating broadcasting to RPF/GRP control room dashboard.
        // We will notify all admin users
        $admins = \App\Models\User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'type' => 'SOS',
                'title' => '🚨 RED ALERT: Passenger SOS Triggered',
                'message' => "Passenger {$user->name} triggered SOS near {$closestStation}. Check complaint dashboard immediately. ID: #SOS-{$complaint->id}.",
                'read_status' => 'Unread',
            ]);
        }

        return redirect()->back()->with('success', 'SOS broadcasted successfully. Emergency responders have been alerted.');
    }

    /**
     * Resolve a complaint (Admin only).
     */
    public function resolve(Request $request, $id)
    {
        // Check if admin is authenticated
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'status' => 'required|in:Open,In Progress,Resolved',
            'resolution_details' => 'required|string|min:5',
        ]);

        $complaint = Complaint::findOrFail($id);
        $complaint->update([
            'status' => $request->status,
            'resolution_details' => $request->resolution_details,
        ]);

        // Notify user about resolution
        Notification::create([
            'user_id' => $complaint->user_id,
            'type' => 'Complaint',
            'title' => "Complaint #{$complaint->id} Status Updated",
            'message' => "Your complaint with ID #{$complaint->id} has been marked as {$request->status}. Details: {$request->resolution_details}",
            'read_status' => 'Unread',
        ]);

        return redirect()->back()->with('success', 'Complaint status updated successfully.');
    }
}
