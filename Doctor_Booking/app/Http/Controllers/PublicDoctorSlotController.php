<?php

namespace App\Http\Controllers;

use App\Models\AvailableSlot;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class PublicDoctorSlotController extends Controller
{
    // GET /api/doctors/{doctor}/slots?date=YYYY-MM-DD&page=1
    public function index(Request $request, User $doctor)
    {
        $validated = $request->validate([
            'date' => ['nullable', 'date_format:Y-m-d'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $perPage = $validated['per_page'] ?? 10;

        $query = AvailableSlot::query()
            ->where('doctor_id', $doctor->id)
            ->where('is_booked', false)
            ->whereDate('date', '>=', now()->toDateString())
            ->orderBy('date')
            ->orderBy('start_time');

        if (!empty($validated['date'])) {
            $query->whereDate('date', $validated['date']);
        }

        $slots = $query->paginate($perPage)->withQueryString();

        $items = collect($slots->items())->map(function ($slot) {
            return [
                'id' => $slot->id,
                'doctor_id' => $slot->doctor_id,
                'date' => $slot->date,
                'start_time' => substr((string) $slot->start_time, 0, 5),
                'end_time' => substr((string) $slot->end_time, 0, 5),
                'is_booked' => (bool) $slot->is_booked,
            ];
        })->values();

        return ApiResponse::ok([
            'items' => $items,
            'meta' => [
                'current_page' => $slots->currentPage(),
                'last_page' => $slots->lastPage(),
                'per_page' => $slots->perPage(),
                'total' => $slots->total(),
            ],
        ], 'OK');
    }
}