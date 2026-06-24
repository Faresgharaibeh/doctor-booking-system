<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminAppointmentController extends Controller
{
   public function index(Request $request)
{
    $validated = $request->validate([
        'status' => ['nullable', 'string', 'max:30'],
        'doctor_id' => ['nullable', 'integer'],
        'user_id' => ['nullable', 'integer'],
        'from' => ['nullable', 'date'],
        'to' => ['nullable', 'date'],
        'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
    ]);

    $perPage = $validated['per_page'] ?? 10;

    $query = Appointment::with(['doctor', 'user']);

    if (!empty($validated['status'])) {
        $query->where('status', $validated['status']);
    }

    if (!empty($validated['doctor_id'])) {
        $query->where('doctor_id', (int) $validated['doctor_id']);
    }

    if (!empty($validated['user_id'])) {
        $query->where('user_id', (int) $validated['user_id']);
    }

    if (!empty($validated['from'])) {
        $query->whereDate('date', '>=', $validated['from']);
    }

    if (!empty($validated['to'])) {
        $query->whereDate('date', '<=', $validated['to']);
    }

    $appointments = $query
        ->orderByDesc('id')
        ->paginate($perPage)
        ->withQueryString();

    return ApiResponse::ok([
        'items' => $appointments->items(),
        'meta' => [
            'current_page' => $appointments->currentPage(),
            'per_page' => $appointments->perPage(),
            'total' => $appointments->total(),
            'last_page' => $appointments->lastPage(),
        ],
    ]);
}


    public function updateStatus(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,confirmed,cancelled,completed'],
        ]);

        DB::transaction(function () use ($appointment, $validated) {
            $appointment->update([
                'status' => $validated['status'],
            ]);
        });

        // load relations if available
        try { $appointment->load(['doctor']); } catch (\Throwable $e) {}
        try { $appointment->load(['user']); } catch (\Throwable $e) {}
        try { $appointment->load(['patient']); } catch (\Throwable $e) {}

        return ApiResponse::ok([
            'appointment' => $appointment,
        ], 'Status updated');
    }

    private function hasColumn(string $table, string $column): bool
    {
        try {
            return \Schema::hasColumn($table, $column);
        } catch (\Throwable $e) {
            return false;
        }
    }

    private function guessDateColumn(): ?string
    {
        if ($this->hasColumn('appointments', 'appointment_date')) return 'appointment_date';
        if ($this->hasColumn('appointments', 'date')) return 'date';
        if ($this->hasColumn('appointments', 'booking_date')) return 'booking_date';
        return null;
    }
}
