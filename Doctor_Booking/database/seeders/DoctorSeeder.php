<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DoctorSeeder extends Seeder
{
    public function run(): void
    {
        $specialtyIdByName = DB::table('specialties')->pluck('id', 'name'); // ["Cardiology" => 1, ...]

        $doctors = [
            ["name" => "Dr. John Doe",       "specialty" => "Cardiology"],
            ["name" => "Dr. Sarah Smith",    "specialty" => "Dermatology"],
            ["name" => "Dr. Michael Brown",  "specialty" => "Orthopedics"],
            ["name" => "Dr. Emily Johnson",  "specialty" => "Pediatrics"],
            ["name" => "Dr. David Wilson",   "specialty" => "Neurology"],
            ["name" => "Dr. Olivia Martinez","specialty" => "Gynecology"],
            ["name" => "Dr. Daniel Anderson","specialty" => "Ophthalmology"],
            ["name" => "Dr. Sophia Taylor",  "specialty" => "ENT"],
        ];

        foreach ($doctors as $d) {
            DB::table('doctors')->insert([
                "name" => $d["name"],
                "specialty_id" => $specialtyIdByName[$d["specialty"]],
                "created_at" => now(),
                "updated_at" => now(),
            ]);
        }
    }
}
