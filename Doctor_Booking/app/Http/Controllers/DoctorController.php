<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
            'search' => ['nullable', 'string', 'max:100'],
            'specialty_id' => ['nullable', 'integer', 'min:1'],
        ]);

        $perPage = $validated['per_page'] ?? 10;

        $query = User::query()
            ->where('role', User::ROLE_DOCTOR)
            ->with(['doctorProfile.specialty']);

        if (!empty($validated['specialty_id'])) {
            $sid = (int) $validated['specialty_id'];

            $query->whereHas('doctorProfile', function ($q) use ($sid) {
                $q->where('specialty_id', $sid);
            });
        }

        if (!empty($validated['search'])) {
            $search = trim($validated['search']);

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $paginator = $query->orderByDesc('id')->paginate($perPage);

        $items = collect($paginator->items())->map(function (User $u) {
            return [
                'id' => $u->id, // user id
                'name' => $u->name,
                'email' => $u->email,
                'specialty' => $u->doctorProfile?->specialty ? [
                    'id' => $u->doctorProfile->specialty->id,
                    'name' => $u->doctorProfile->specialty->name,
                ] : null,
            ];
        })->values();

        return ApiResponse::ok([
            'items' => $items,
            'pagination' => [
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        ], 'OK');
    }

    /**
     * Public doctor details
     * Route binding: /doctors/{doctor} where {doctor} is a User id
     */
    public function show(User $doctor)
    {
        if ($doctor->role !== User::ROLE_DOCTOR) {
            return ApiResponse::error('Doctor not found', [], 404);
        }

        $doctor->load(['doctorProfile.specialty']);

        return ApiResponse::ok([
            'doctor' => [
                'id' => $doctor->id,
                'name' => $doctor->name,
                'email' => $doctor->email,
                'role' => $doctor->role,
                'specialty' => $doctor->doctorProfile?->specialty ? [
                    'id' => $doctor->doctorProfile->specialty->id,
                    'name' => $doctor->doctorProfile->specialty->name,
                ] : null,
                'doctor_profile' => $doctor->doctorProfile,
            ],
        ], 'Doctor details');
    }
}