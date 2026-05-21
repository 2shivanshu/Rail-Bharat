<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Train extends Model
{
    use HasFactory;

    protected $fillable = ['train_number', 'name', 'type', 'source_station_id', 'destination_station_id', 'runs_on'];

    public function sourceStation()
    {
        return $this->belongsTo(Station::class, 'source_station_id');
    }

    public function destinationStation()
    {
        return $this->belongsTo(Station::class, 'destination_station_id');
    }

    public function routes()
    {
        return $this->hasMany(Route::class)->orderBy('stop_number');
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }

    public function coaches()
    {
        return $this->hasMany(Coach::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
