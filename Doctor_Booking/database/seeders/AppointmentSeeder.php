<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AppointmentSeeder extends Seeder
{
    public function run(): void
    {
        // تأكد إن عندك doctor 1 و user 1 موجودين من seeders السابقة
        DB::table('appointments')->insert([
            [
                "doctor_id" => 1,
                "user_id" => 1,
                "date" => "2026-02-16",
                "time" => "09:00:00",
                "status" => "pending",
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "doctor_id" => 1,
                "user_id" => 1,
                "date" => "2026-02-16",
                "time" => "09:30:00",
                "status" => "confirmed",
                "created_at" => now(),
                "updated_at" => now(),
            ],
        ]);
    }
}
