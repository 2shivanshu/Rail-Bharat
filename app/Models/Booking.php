<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'train_id', 'schedule_id', 'pnr', 'booking_date',
        'journey_date', 'source_station_id', 'destination_station_id',
        'class_type', 'total_fare', 'status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function train()
    {
        return $this->belongsTo(Train::class);
    }

    public function schedule()
    {
        return $this->belongsTo(Schedule::class);
    }

    public function sourceStation()
    {
        return $this->belongsTo(Station::class, 'source_station_id');
    }

    public function destinationStation()
    {
        return $this->belongsTo(Station::class, 'destination_station_id');
    }

    public function passengers()
    {
        return $this->hasMany(Passenger::class);
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }
}
