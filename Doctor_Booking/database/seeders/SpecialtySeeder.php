<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SpecialtySeeder extends Seeder
{
    public function run(): void
    {
        $names = [
            "Cardiology",
            "Dermatology",
            "Orthopedics",
            "Pediatrics",
            "Neurology",
            "Gynecology",
            "Ophthalmology",
            "ENT",
        ];

        foreach ($names as $name) {
            DB::table('specialties')->insert([
                "name" => $name,
                "created_at" => now(),
                "updated_at" => now(),
            ]);
        }
    }
}
