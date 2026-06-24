<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use App\Models\AvailableSlot;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DoctorSlotController extends Controller
{
    public function index(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        if (!$user || $user->role !== User::ROLE_DOCTOR) {
            return ApiResponse::error('Unauthorized', [], 403);
        }

        $validated = $request->validate([
            'date' => ['nullable', 'date_format:Y-m-d'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $perPage = $validated['per_page'] ?? 10;

        $query = AvailableSlot::query()
            ->where('doctor_id', $user->id)
            ->orderByDesc('date')
            ->orderByDesc('start_time');

        if (!empty($validated['date'])) {
            $query->whereDate('date', $validated['date']);
        }

        $p = $query->paginate($perPage);

        return ApiResponse::ok([
            'items' => $p->items(),
            'meta' => [
                'current_page' => $p->currentPage(),
                'last_page' => $p->lastPage(),
                'per_page' => $p->perPage(),
                'total' => $p->total(),
            ],
        ], 'OK');
    }

    public function store(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        if (!$user || $user->role !== User::ROLE_DOCTOR) {
            return ApiResponse::error('Unauthorized', [], 403);
        }

        $validated = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
        ]);

        $slot = DB::transaction(function () use ($user, $validated) {
            // prevent duplicates
            $exists = AvailableSlot::query()
                ->where('doctor_id', $user->id)
                ->whereDate('date', $validated['date'])
                ->whereTime('start_time', $validated['start_time'])
                ->exists();

            if ($exists) {
                abort(409, 'Slot already exists');
            }

            return AvailableSlot::create([
                'doctor_id' => $user->id,
                'date' => $validated['date'],
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time'],
                'is_booked' => false,
            ]);
        });

        return ApiResponse::ok([
            'slot' => $slot,
        ], 'Slot created');
    }

    public function destroy(Request $request, AvailableSlot $slot)
    {
        /** @var User $user */
        $user = $request->user();

        if (!$user || $user->role !== User::ROLE_DOCTOR) {
            return ApiResponse::error('Unauthorized', [], 403);
        }

        // ensure ownership
        if ((int) $slot->doctor_id !== (int) $user->id) {
            return ApiResponse::error('Forbidden', [], 403);
        }

        if ($slot->is_booked) {
            return ApiResponse::error('Cannot delete a booked slot', [], 409);
        }

        $slot->delete();

        return ApiResponse::ok(null, 'Slot deleted');
    }
}