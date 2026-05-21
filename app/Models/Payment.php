<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = ['booking_id', 'transaction_id', 'amount', 'payment_status', 'payment_method'];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
