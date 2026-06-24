<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class DoctorStatsController extends Controller
{
    public function index(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        // ✅ In the new system, the doctor IS the authenticated user
        if (!$user || $user->role !== User::ROLE_DOCTOR) {
            return ApiResponse::error('Unauthorized', [], 403);
        }

        // ✅ Appointments should reference doctor_user_id (recommended)
        // If your appointments table currently uses doctor_id as "user_id", keep it as is.
        $base = Appointment::query()->where('doctor_id', $user->id);

        return ApiResponse::ok([
            'total' => (clone $base)->count(),
            'pending' => (clone $base)->where('status', 'pending')->count(),
            'confirmed' => (clone $base)->where('status', 'confirmed')->count(),
            'cancelled' => (clone $base)->where('status', 'cancelled')->count(),
            'completed' => (clone $base)->where('status', 'completed')->count(),
        ], 'OK');
    }
}