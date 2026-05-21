<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MealOption extends Model
{
    protected $fillable = [
        'station_id',
        'item_name',
        'description',
        'price',
        'is_available',
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'price' => 'decimal:2',
    ];

    public function station(): BelongsTo
    {
        return $this->belongsTo(Station::class);
    }
}
