<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\DoctorDayOff;
use App\Models\DoctorSchedule;
use App\Models\User;
use App\Support\ApiResponse;
use Carbon\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

// ✅ notifications
use App\Notifications\DoctorNewBookingNotification;

class AppointmentController extends Controller
{
    /**
     * ✅ POST /api/appointments (protected)
     * Legacy booking endpoint (schedule-based)
     * - Works with NEW system where doctor_id is a USER id (role=doctor)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            "doctor_id" => ["required", "integer", "min:1"],
            "date"      => ["required", "date_format:Y-m-d"],
            "time"      => ["required", "date_format:H:i"],
            "status"    => ["nullable", "in:pending,confirmed"],
        ]);

        $validated["status"] = $validated["status"] ?? "pending";

        // ✅ Normalize
        $doctorId = (int) $validated["doctor_id"];
        $date = $validated["date"];
        $time = $validated["time"];

        // ✅ ensure doctor exists and is role=doctor
        $doctorUser = User::query()
            ->where('id', $doctorId)
            ->where('role', User::ROLE_DOCTOR)
            ->first();

        if (!$doctorUser) {
            return ApiResponse::error("Validation error", [
                "doctor_id" => ["Doctor not found."],
            ], 422);
        }

        // ✅ new system fields
        $validated["patient_user_id"] = $request->user()->id;
        $validated["start_time"] = $validated["time"];
        $validated["end_time"] = Carbon::createFromFormat('H:i', $validated["time"])
            ->addMinutes(30)
            ->format('H:i');

        // ✅ Keep legacy field if exists in older DBs (optional)
        // NOTE: If your appointments table DOES NOT have user_id, remove this line.
        $validated["user_id"] = $request->user()->id;

        // 1) prevent booking in the past
        $slotDateTime = Carbon::createFromFormat('Y-m-d H:i', "$date $time");
        if ($slotDateTime->isPast()) {
            return ApiResponse::error("Validation error", [
                "date" => ["Past date/time is not allowed."],
            ], 422);
        }

        // 2) day off check (if you still use schedule tables)
        $isDayOff = DoctorDayOff::query()
            ->where('doctor_id', $doctorId)
            ->where('date', $date)
            ->exists();

        if ($isDayOff) {
            return ApiResponse::error("Validation error", [
                "date" => ["Doctor day off."],
            ], 422);
        }

        // 3) schedule check
        $dayOfWeek = strtolower(Carbon::parse($date)->format('l')); // monday...

        $schedule = DoctorSchedule::query()
            ->where('doctor_id', $doctorId)
            ->where('day_of_week', $dayOfWeek)
            ->first();

        if (!$schedule) {
            return ApiResponse::error("Validation error", [
                "date" => ["No schedule found for this day."],
            ], 422);
        }

        // 4) validate time inside schedule + 30-min grid
        $start = Carbon::createFromFormat('H:i:s', $schedule->start_time);
        $end   = Carbon::createFromFormat('H:i:s', $schedule->end_time);
        $t     = Carbon::createFromFormat('H:i', $time);

        if ($t < $start || $t >= $end) {
            return ApiResponse::error("Validation error", [
                "time" => ["Outside schedule range."],
            ], 422);
        }

        $minutes = (int) $t->format('i');
        if (!in_array($minutes, [0, 30], true)) {
            return ApiResponse::error("Validation error", [
                "time" => ["Allowed minutes: 00 or 30."],
            ], 422);
        }

        try {
            $appointment = Appointment::create([
                // ✅ core fields
                'doctor_id' => $doctorId,
                'patient_user_id' => $request->user()->id,
                'date' => $date,
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time'],
                'status' => $validated['status'],

                // ✅ legacy (only if column exists)
                'user_id' => $request->user()->id,
            ]);

            // ✅ load doctor & patient (doctor is User now)
            $appointment->loadMissing(['doctor', 'patient']);

            // ✅ notify doctor (production-safe)
            try {
                $appointment->doctor?->notify(new DoctorNewBookingNotification($appointment));
            } catch (\Throwable $e) {
                // do not break booking if notification fails
            }

            return ApiResponse::ok([
                "id" => $appointment->id,
                "doctor_id" => $appointment->doctor_id,
                "patient_user_id" => $appointment->patient_user_id,
                "date" => $appointment->date->format('Y-m-d'),
                "start_time" => $appointment->start_time ? substr($appointment->start_time, 0, 5) : null,
                "end_time" => $appointment->end_time ? substr($appointment->end_time, 0, 5) : null,
                "status" => $appointment->status,
            ], "Appointment created", 201);

        } catch (QueryException $e) {
            if (str_contains($e->getMessage(), 'UNIQUE') || str_contains($e->getMessage(), 'unique')) {
                return ApiResponse::error("This slot is already booked", [
                    "time" => ["Slot already booked."],
                ], 409);
            }

            throw $e;
        }
    }

    /**
     * ✅ GET /api/appointments (protected)
     * Patient appointments ONLY (kept for backward compatibility)
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            "per_page" => ["nullable", "integer", "min:1", "max:50"],
            "status"   => ["nullable", "in:pending,confirmed,cancelled,completed"],
            "date"     => ["nullable", "date_format:Y-m-d"],
        ]);

        $perPage = $validated["per_page"] ?? 10;
        $userId = $request->user()->id;

        $query = Appointment::query()
            ->with(['doctor']) // ✅ doctor is User now
            ->where('patient_user_id', $userId)
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

            "start_time" => $a->start_time ? substr($a->start_time, 0, 5) : null,
            "end_time"   => $a->end_time ? substr($a->end_time, 0, 5) : null,

            // ✅ compatibility for old frontend that uses "time"
            "time" => $a->start_time ? substr($a->start_time, 0, 5) : null,

            "status" => $a->status,

            "doctor" => $a->doctor ? [
                "id" => $a->doctor->id,
                "name" => $a->doctor->name,
                "email" => $a->doctor->email,
            ] : null,

            "specialty" => null,
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

    /**
     * ✅ GET /api/doctor/appointments (protected)
     * Doctor appointments ONLY (doctor_id = auth user id)
     */
    public function doctorIndex(Request $request): JsonResponse
    {
        $validated = $request->validate([
            "per_page" => ["nullable", "integer", "min:1", "max:50"],
            "status"   => ["nullable", "in:pending,confirmed,cancelled,completed"],
            "date"     => ["nullable", "date_format:Y-m-d"],
        ]);

        $user = $request->user();

        if ($user->role !== User::ROLE_DOCTOR) {
            return ApiResponse::error("Forbidden", [], 403);
        }

        $perPage = $validated["per_page"] ?? 10;
        $doctorId = $user->id;

        $query = Appointment::query()
            ->with(['patient']) // ✅ doctor is me, show patient info
            ->where('doctor_id', $doctorId)
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

            "start_time" => $a->start_time ? substr($a->start_time, 0, 5) : null,
            "end_time"   => $a->end_time ? substr($a->end_time, 0, 5) : null,
            "time"       => $a->start_time ? substr($a->start_time, 0, 5) : null,

            "status" => $a->status,

            "patient" => $a->patient ? [
                "id" => $a->patient->id,
                "name" => $a->patient->name,
                "email" => $a->patient->email,
            ] : null,

            "specialty" => null,
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

    /**
     * ✅ PATCH /api/appointments/{appointment}/status (protected)
     * Patient updates own appointment status
     */
    public function updateStatus(Request $request, Appointment $appointment): JsonResponse
    {
        if ((int) $appointment->patient_user_id !== (int) $request->user()->id) {
            return ApiResponse::error("Forbidden", [], 403);
        }

        $validated = $request->validate([
            "status" => ["required", "in:pending,confirmed,cancelled,completed"],
        ]);

        $appointment->update([
            "status" => $validated["status"],
        ]);

        return ApiResponse::ok([
            "id" => $appointment->id,
            "doctor_id" => $appointment->doctor_id,
            "patient_user_id" => $appointment->patient_user_id,
            "date" => $appointment->date->format('Y-m-d'),
            "start_time" => $appointment->start_time ? substr($appointment->start_time, 0, 5) : null,
            "end_time" => $appointment->end_time ? substr($appointment->end_time, 0, 5) : null,
            "status" => $appointment->status,
        ], "Appointment status updated");
    }

    /**
     * ✅ DELETE /api/appointments/{appointment} (protected)
     */
    public function destroy(Request $request, Appointment $appointment): JsonResponse
    {
        if ((int) $appointment->patient_user_id !== (int) $request->user()->id) {
            return ApiResponse::error("Forbidden", [], 403);
        }

        $appointment->delete();

        return ApiResponse::ok(null, "Appointment cancelled");
    }
}