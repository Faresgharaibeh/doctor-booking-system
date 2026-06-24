<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

use App\Notifications\PatientAppointmentConfirmedNotification;

class DoctorAppointmentController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            "per_page" => ["nullable", "integer", "min:1", "max:50"],
            "status"   => ["nullable", "in:pending,confirmed,cancelled,completed"],
            "date"     => ["nullable", "date_format:Y-m-d"],
        ]);

        $perPage = $validated["per_page"] ?? 10;

        // ✅ doctor is the authenticated user
        $doctorId = $request->user()->id;

        // ✅ safety guard (route already has role:doctor, but keep defensive)
        if ($request->user()->role !== User::ROLE_DOCTOR) {
            return ApiResponse::error("Forbidden", [], 403);
        }

        $query = Appointment::query()
            ->with(['patient'])          // show patient info for doctor
            ->where('doctor_id', $doctorId) // ✅ doctor_id references users.id
            ->orderBy('date')
            ->orderBy('start_time');

        if (!empty($validated["status"])) {
            $query->where('status', $validated["status"]);
        }

        if (!empty($validated["date"])) {
            $query->where('date', $validated["date"]);
        }

        $paginator = $query->paginate($perPage);

        $items = collect($paginator->items())->map(fn ($a) => [
            "id" => $a->id,
            "date" => $a->date->format('Y-m-d'),
            "start_time" => $a->start_time ? substr((string)$a->start_time, 0, 5) : null,
            "end_time"   => $a->end_time ? substr((string)$a->end_time, 0, 5) : null,

            // ✅ compatibility: some UI uses `time`
            "time" => $a->start_time ? substr((string)$a->start_time, 0, 5) : null,

            "status" => $a->status,
            "patient" => $a->patient ? [
                "id" => $a->patient->id,
                "name" => $a->patient->name,
                "email" => $a->patient->email,
            ] : null,
        ])->values();

        return ApiResponse::ok([
            "items" => $items,
            "pagination" => [
                "page" => $paginator->currentPage(),
                "per_page" => $paginator->perPage(),
                "total" => $paginator->total(),
                "last_page" => $paginator->lastPage(),
            ],
        ], "OK");
    }

    public function updateStatus(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            "status" => ["required", "in:pending,confirmed,cancelled,completed"],
        ]);

        $doctorId = $request->user()->id;

        if ($request->user()->role !== User::ROLE_DOCTOR) {
            return ApiResponse::error("Forbidden", [], 403);
        }

        // ✅ doctor can only update his own appointments
        if ((int)$appointment->doctor_id !== (int)$doctorId) {
            return ApiResponse::error("Forbidden", [], 403);
        }

        $oldStatus = (string) $appointment->status;
        $newStatus = (string) $validated["status"];

        $appointment->update([
            "status" => $newStatus,
        ]);

        // ✅ Notify patient on status change (production-safe)
        if ($oldStatus !== $newStatus) {
            try {
                $appointment->loadMissing(['patient', 'doctor']);

                if ($appointment->patient && $newStatus === 'confirmed') {
                    $appointment->patient->notify(
                        new PatientAppointmentConfirmedNotification($appointment)
                    );
                }
            } catch (\Throwable $e) {
                // don't break API if notification fails
            }
        }

        return ApiResponse::ok([
            "id" => $appointment->id,
            "doctor_id" => $appointment->doctor_id,
            "patient_user_id" => $appointment->patient_user_id,
            "date" => $appointment->date->format('Y-m-d'),
            "start_time" => $appointment->start_time ? substr((string)$appointment->start_time, 0, 5) : null,
            "end_time" => $appointment->end_time ? substr((string)$appointment->end_time, 0, 5) : null,
            "status" => $appointment->status,
        ], "Status updated");
    }
}