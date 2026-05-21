<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coach extends Model
{
    use HasFactory;

    protected $fillable = ['train_id', 'coach_number', 'class_type', 'total_seats'];

    public function train()
    {
        return $this->belongsTo(Train::class);
    }
}
