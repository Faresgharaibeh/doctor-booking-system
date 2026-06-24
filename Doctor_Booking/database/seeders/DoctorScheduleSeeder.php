<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DoctorScheduleSeeder extends Seeder
{
    public function run(): void
    {
        // لكل دكتور: Mon-Thu 09:00-12:00
        $doctors = DB::table('doctors')->pluck('id');

        foreach ($doctors as $doctorId) {
            foreach (['monday', 'tuesday', 'wednesday', 'thursday'] as $day) {
                DB::table('doctor_schedules')->insert([
                    'doctor_id' => $doctorId,
                    'day_of_week' => $day,
                    'start_time' => '09:00:00',
                    'end_time' => '12:00:00',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
