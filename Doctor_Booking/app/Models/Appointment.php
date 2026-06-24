<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'doctor_id',        // ✅ doctor is USER id
        'patient_user_id',  // ✅ patient is USER id
        'slot_id',
        'date',
        'start_time',
        'end_time',
        'status',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
        'start_time' => 'string',
        'end_time' => 'string',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships (NEW SYSTEM)
    |--------------------------------------------------------------------------
    */

    public function doctor()
    {
        // ✅ doctor is a User (role=doctor)
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_user_id');
    }

    public function slot()
    {
        return $this->belongsTo(AvailableSlot::class, 'slot_id');
    }
}