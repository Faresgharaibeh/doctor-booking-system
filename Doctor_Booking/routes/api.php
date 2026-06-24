<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\SpecialtyController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\DoctorAvailabilityController;
use App\Http\Controllers\PublicDoctorSlotController;
use App\Http\Controllers\AI\FaqAssistantController;

// Doctor Panel
use App\Http\Controllers\Doctor\DoctorAppointmentController;
use App\Http\Controllers\Doctor\DoctorStatsController;
use App\Http\Controllers\Doctor\DoctorSlotController;

// Patient Booking
use App\Http\Controllers\Patient\BookAppointmentController;

// Admin Panel
use App\Http\Controllers\Admin\AdminDoctorController;
use App\Http\Controllers\Admin\AdminAppointmentController;
use App\Http\Controllers\Admin\AdminStatsController;

// Models (for route bindings)
use App\Models\User;
use App\Models\Appointment;
use App\Models\AvailableSlot;

Route::get('/health', fn () => response()->json(['status' => 'ok']));

/*
|--------------------------------------------------------------------------
| Route Model Bindings (New System)
|--------------------------------------------------------------------------
| doctor => User where role=doctor
|--------------------------------------------------------------------------
*/
Route::bind('doctor', function ($value) {
    return User::where('id', $value)
        ->where('role', User::ROLE_DOCTOR)
        ->firstOrFail();
});

Route::bind('appointment', function ($value) {
    return Appointment::findOrFail($value);
});

Route::bind('slot', function ($value) {
    return AvailableSlot::findOrFail($value);
});

/*
|--------------------------------------------------------------------------
| Public (no auth)
|--------------------------------------------------------------------------
*/
Route::get('/specialties', [SpecialtyController::class, 'index']);

// Public Doctors (doctor is USER role=doctor via binding)
Route::get('/doctors', [DoctorController::class, 'index']);
Route::get('/doctors/{doctor}', [DoctorController::class, 'show']);
Route::get('/doctors/{doctor}/availability', [DoctorAvailabilityController::class, 'show']);
Route::get('/doctors/{doctor}/slots', [PublicDoctorSlotController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Auth (Public)
|--------------------------------------------------------------------------
*/
Route::options('/auth/login', function () {
    return response()->noContent();
});

Route::options('/auth/register', function () {
    return response()->noContent();
});

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Protected (auth:sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // Auth profile
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    /*
    |--------------------------------------------------------------------------
    | AI FAQ Assistant (any authenticated user)
    |--------------------------------------------------------------------------
    */
    Route::post('/ai/faq/ask', [FaqAssistantController::class, 'ask'])
        ->middleware('throttle:30,1');

    /*
    |--------------------------------------------------------------------------
    | Notifications (any authenticated user)
    |--------------------------------------------------------------------------
    */
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread', [NotificationController::class, 'unread']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    /*
    |--------------------------------------------------------------------------
    | Admin Panel APIs (admin only)
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:admin')->prefix('admin')->group(function () {

        Route::get('/ping', fn () =>
            \App\Support\ApiResponse::ok(['ok' => true], 'OK')
        );

        // Admin Doctors CRUD (doctor is User role=doctor via binding)
        Route::get('/doctors', [AdminDoctorController::class, 'index']);
        Route::post('/doctors', [AdminDoctorController::class, 'store']);
        Route::put('/doctors/{doctor}', [AdminDoctorController::class, 'update']);
        Route::delete('/doctors/{doctor}', [AdminDoctorController::class, 'destroy']);

        // Admin Appointments & Stats
        Route::get('/appointments', [AdminAppointmentController::class, 'index']);
        Route::get('/stats', [AdminStatsController::class, 'index']);
    });

    /*
    |--------------------------------------------------------------------------
    | Doctor Panel APIs (doctor only)
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:doctor')->prefix('doctor')->group(function () {

        Route::get('/appointments', [DoctorAppointmentController::class, 'index']);
        Route::patch('/appointments/{appointment}/status', [DoctorAppointmentController::class, 'updateStatus']);

        Route::get('/stats', [DoctorStatsController::class, 'index']);

        Route::get('/slots', [DoctorSlotController::class, 'index']);
        Route::post('/slots', [DoctorSlotController::class, 'store']);
        Route::delete('/slots/{slot}', [DoctorSlotController::class, 'destroy']);
    });

    /*
    |--------------------------------------------------------------------------
    | Patient APIs (patient only)
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:patient')->group(function () {
        Route::post('/appointments/book', [BookAppointmentController::class, 'store']);
    });

    /*
    |--------------------------------------------------------------------------
    | Generic Appointments (Any authenticated user)
    |--------------------------------------------------------------------------
    */
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::get('/appointments', [AppointmentController::class, 'index']);
    Route::patch('/appointments/{appointment}/status', [AppointmentController::class, 'updateStatus']);
    Route::delete('/appointments/{appointment}', [AppointmentController::class, 'destroy']);
});