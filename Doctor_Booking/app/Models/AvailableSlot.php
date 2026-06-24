<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AvailableSlot extends Model
{
    use HasFactory;

    protected $fillable = [
        'doctor_id',
        'date',
        'start_time',
        'end_time',
        'is_booked',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
        'is_booked' => 'boolean',
    ];

    public function doctor()
    {
        // doctor is a User
        return $this->belongsTo(User::class, 'doctor_id');
    }
}