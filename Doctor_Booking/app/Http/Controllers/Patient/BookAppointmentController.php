<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\AvailableSlot;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// ✅ NEW
use App\Notifications\DoctorNewBookingNotification;

class BookAppointmentController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'slot_id' => ['required', 'integer', 'exists:available_slots,id'],
        ]);

        $patientId = (int) $request->user()->id;

        $result = DB::transaction(function () use ($validated, $patientId) {

            $slot = AvailableSlot::query()
                ->where('id', $validated['slot_id'])
                ->lockForUpdate()
                ->firstOrFail();

            if ((bool) $slot->is_booked) {
                return [
                    'ok' => false,
                    'status' => 422,
                    'payload' => ['message' => 'Slot already booked.'],
                ];
            }

            $appointment = Appointment::create([
                'doctor_id' => $slot->doctor_id,
                'patient_user_id' => $patientId,
                'slot_id' => $slot->id,
                'date' => $slot->date,
                'start_time' => $slot->start_time,
                'end_time' => $slot->end_time,
                'status' => 'pending',
            ]);

            $slot->update(['is_booked' => true]);

            // ✅ return appointment id to notify after transaction
            return [
                'ok' => true,
                'status' => 201,
                'appointment_id' => $appointment->id,
            ];
        });

        if (!$result['ok']) {
            return response()->json($result['payload'], $result['status']);
        }

        // ✅ Notify doctor (outside transaction for safety)
        try {
            $appointment = Appointment::query()
                ->with(['patient', 'doctor.user'])
                ->findOrFail($result['appointment_id']);

            $doctorUser = $appointment->doctor?->user;

            if ($doctorUser) {
                $doctorUser->notify(new DoctorNewBookingNotification($appointment));
            }
        } catch (\Throwable $e) {
            // production-safe: do not fail booking if notification/email fails
            // logger()->warning($e->getMessage());
        }

        // ✅ fresh appointment response
        $appointment = Appointment::findOrFail($result['appointment_id']);

        return response()->json([
            'message' => 'Appointment booked successfully.',
            'data' => $appointment,
        ], 201);
    }
}