<?php

namespace App\Http\Controllers;

use App\Models\AvailableSlot;
use App\Models\User;
use App\Support\ApiResponse;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DoctorAvailabilityController extends Controller
{
    // GET /api/doctors/{doctor}/availability?date=YYYY-MM-DD
    public function show(Request $request, User $doctor)
    {
        // {doctor} is bound to User(role=doctor) via routes binding (api.php)

        $validated = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
        ]);

        $date = $validated['date'];

        $query = AvailableSlot::query()
            ->where('doctor_id', $doctor->id)
            ->whereDate('date', $date)
            ->where('is_booked', false)
            ->orderBy('start_time');

        $slots = $query->get()->map(function ($slot) {
            return [
                'id' => $slot->id,
                'date' => $slot->date,
                'start_time' => substr((string) $slot->start_time, 0, 5),
                'end_time' => substr((string) $slot->end_time, 0, 5),
                'is_booked' => (bool) $slot->is_booked,
            ];
        })->values();

        // remove past times if date is today
        $today = Carbon::today()->format('Y-m-d');
        if ($date === $today) {
            $now = Carbon::now();
            $slots = $slots->filter(function ($s) use ($date, $now) {
                $dt = Carbon::createFromFormat('Y-m-d H:i', $date . ' ' . $s['start_time']);
                return $dt->greaterThan($now);
            })->values();
        }

        return ApiResponse::ok([
            'doctor_id' => $doctor->id,
            'date' => $date,
            'slots' => $slots,
        ], 'OK');
    }
}