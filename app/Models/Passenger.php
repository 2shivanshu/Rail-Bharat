<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Passenger extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id', 'name', 'age', 'gender',
        'coach_number', 'seat_number', 'berth_preference',
        'status', 'wl_number'
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function ticket()
    {
        return $this->hasOne(Ticket::class);
    }
}
