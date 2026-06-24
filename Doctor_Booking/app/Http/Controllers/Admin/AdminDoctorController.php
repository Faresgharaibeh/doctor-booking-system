<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\DoctorProfile;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminDoctorController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'specialty_id' => ['nullable', 'integer'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
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

        if (!empty($validated['q'])) {
            $q = trim($validated['q']);

            $query->where(function ($qq) use ($q) {
                $qq->where('name', 'like', "%{$q}%")
                   ->orWhere('email', 'like', "%{$q}%");
            });
        }

        $doctors = $query
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        // normalize response shape for frontend
        $items = collect($doctors->items())->map(function (User $u) {
            return [
                'id' => $u->id, // doctor user id
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role,
                'specialty' => $u->doctorProfile?->specialty,
                'doctor_profile' => $u->doctorProfile,
                'created_at' => $u->created_at,
            ];
        });

        return ApiResponse::ok([
            'items' => $items,
            'meta' => [
                'current_page' => $doctors->currentPage(),
                'per_page' => $doctors->perPage(),
                'total' => $doctors->total(),
                'last_page' => $doctors->lastPage(),
            ],
        ], 'OK');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'specialty_id' => ['required', 'integer', 'exists:specialties,id'],
        ]);

        $doctorUser = DB::transaction(function () use ($validated) {
            $email = strtolower(trim($validated['email']));

            $user = User::create([
                'name' => $validated['name'],
                'email' => $email,
                'password' => Hash::make($validated['password']),
                'role' => User::ROLE_DOCTOR,
            ]);

            DoctorProfile::create([
                'user_id' => $user->id,
                'specialty_id' => (int) $validated['specialty_id'],
                // add more fields later (bio, phone, city, etc.)
            ]);

            return $user;
        });

        $doctorUser->load(['doctorProfile.specialty']);

        return ApiResponse::ok([
            'doctor' => [
                'id' => $doctorUser->id,
                'name' => $doctorUser->name,
                'email' => $doctorUser->email,
                'role' => $doctorUser->role,
                'specialty' => $doctorUser->doctorProfile?->specialty,
                'doctor_profile' => $doctorUser->doctorProfile,
            ],
        ], 'Doctor created');
    }

    public function update(Request $request, User $doctor)
    {
        // IMPORTANT: route model binding /admin/doctors/{doctor} now binds to User
        if ($doctor->role !== User::ROLE_DOCTOR) {
            return ApiResponse::error('Not a doctor user', [], 404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email,' . $doctor->id],
            'password' => ['nullable', 'string', 'min:8'],
            'specialty_id' => ['required', 'integer', 'exists:specialties,id'],
        ]);

        DB::transaction(function () use ($doctor, $validated) {
            $userData = [
                'name' => $validated['name'],
            ];

            if (!empty($validated['email'])) {
                $userData['email'] = strtolower(trim($validated['email']));
            }

            if (!empty($validated['password'])) {
                $userData['password'] = Hash::make($validated['password']);
            }

            $doctor->update($userData);

            // ensure profile exists
            $profile = $doctor->doctorProfile ?: DoctorProfile::create([
                'user_id' => $doctor->id,
                'specialty_id' => (int) $validated['specialty_id'],
            ]);

            $profile->update([
                'specialty_id' => (int) $validated['specialty_id'],
            ]);
        });

        $doctor->load(['doctorProfile.specialty']);

        return ApiResponse::ok([
            'doctor' => [
                'id' => $doctor->id,
                'name' => $doctor->name,
                'email' => $doctor->email,
                'role' => $doctor->role,
                'specialty' => $doctor->doctorProfile?->specialty,
                'doctor_profile' => $doctor->doctorProfile,
            ],
        ], 'Doctor updated');
    }

    public function destroy(User $doctor)
    {
        if ($doctor->role !== User::ROLE_DOCTOR) {
            return ApiResponse::error('Not a doctor user', [], 404);
        }

        $hasAppointments = $doctor->doctorAppointments()->exists();
        if ($hasAppointments) {
            return ApiResponse::error('Cannot delete doctor with appointments', [], 409);
        }

        DB::transaction(function () use ($doctor) {
            // profile will be deleted if FK cascade is set; otherwise delete manually:
            $doctor->doctorProfile()?->delete();
            $doctor->delete();
        });

        return ApiResponse::ok(null, 'Doctor deleted');
    }
}