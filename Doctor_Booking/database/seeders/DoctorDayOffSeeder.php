<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DoctorDayOffSeeder extends Seeder
{
    public function run(): void
    {
        // مثال: الدكتور 1 عنده day off بتاريخ 2026-02-17
        DB::table('doctor_day_offs')->insert([
            'doctor_id' => 1,
            'date' => '2026-02-17',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
