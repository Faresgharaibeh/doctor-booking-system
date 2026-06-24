<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('users')->insert([
            "name" => "Test User",
            "email" => "test@example.com",
            "password" => Hash::make("password"),
            "created_at" => now(),
            "updated_at" => now(),
        ]);
    }
}
