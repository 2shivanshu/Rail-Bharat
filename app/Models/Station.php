<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Station extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'code', 'city'];

    public function departingTrains()
    {
        return $this->hasMany(Train::class, 'source_station_id');
    }

    public function arrivingTrains()
    {
        return $this->hasMany(Train::class, 'destination_station_id');
    }

    public function routes()
    {
        return $this->hasMany(Route::class);
    }
}
