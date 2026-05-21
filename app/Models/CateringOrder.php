<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CateringOrder extends Model
{
    protected $fillable = [
        'booking_id',
        'station_id',
        'item_details',
        'total_price',
        'payment_status',
        'delivery_status',
    ];

    protected $casts = [
        'item_details' => 'array',
        'total_price' => 'decimal:2',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function station(): BelongsTo
    {
        return $this->belongsTo(Station::class);
    }
}
