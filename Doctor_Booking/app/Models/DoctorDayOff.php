<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DoctorDayOff extends Model
{
    use HasFactory;

    protected $fillable = ['doctor_id', 'date'];

    protected $casts = [
        'date' => 'date:Y-m-d',
    ];

    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }
}
