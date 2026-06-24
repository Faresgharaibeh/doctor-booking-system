<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    protected $fillable = [
        'user_id',
        'specialty_id',
        'name', // مؤقتًا إلى أن نحذفه لاحقًا
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function specialty()
    {
        return $this->belongsTo(Specialty::class);
    }

    public function schedules()
    {
        return $this->hasMany(DoctorSchedule::class);
    }

    public function dayOffs()
    {
        return $this->hasMany(DoctorDayOff::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }
    public function availableSlots()
{
    return $this->hasMany(\App\Models\AvailableSlot::class);
}


}
