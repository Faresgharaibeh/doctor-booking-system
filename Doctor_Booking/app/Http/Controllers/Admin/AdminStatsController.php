<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Appointment;
use App\Support\ApiResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminStatsController extends Controller
{
    public function index()
    {
        // 1) Overview
        $overview = [
            'users' => User::count(),
            'doctors' => User::where('role', User::ROLE_DOCTOR)->count(),
            'appointments' => Appointment::count(),
        ];

        // 2) Last 7 Days Trend (by appointment date)
        $startDate = Carbon::now()->subDays(6)->startOfDay()->format('Y-m-d');

        $trendRaw = Appointment::select(
                DB::raw("date as date"),
                DB::raw("COUNT(*) as count")
            )
            ->where('date', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $trend = collect();
        for ($i = 0; $i < 7; $i++) {
            $date = Carbon::now()->subDays(6 - $i)->format('Y-m-d');
            $trend->push([
                'date' => $date,
                'count' => $trendRaw[$date]->count ?? 0,
            ]);
        }

        // 3) Status Distribution
        $statusDistribution = Appointment::select(
                'status',
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('status')
            ->get();

        // 4) Top Doctors (by appointments count)
        $topDoctors = Appointment::select('doctor_id', DB::raw('COUNT(*) as count'))
            ->groupBy('doctor_id')
            ->orderByDesc('count')
            ->limit(5)
            ->get()
            ->map(function ($row) {
                $user = User::select('id', 'name', 'email')
                    ->where('id', $row->doctor_id)
                    ->first();

                return [
                    'doctor_id' => $row->doctor_id,
                    'name' => $user?->name ?? 'Unknown',
                    'email' => $user?->email ?? null,
                    'appointments_count' => (int) $row->count,
                ];
            });

        return ApiResponse::ok([
            'overview' => $overview,
            'trend' => $trend,
            'status_distribution' => $statusDistribution,
            'top_doctors' => $topDoctors,
        ], 'OK');
    }
}