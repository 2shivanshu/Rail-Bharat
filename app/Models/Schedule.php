<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    use HasFactory;

    protected $fillable = ['train_id', 'departure_date', 'status', 'delay_minutes'];

    public function train()
    {
        return $this->belongsTo(Train::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
