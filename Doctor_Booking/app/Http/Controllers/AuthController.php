<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $email = strtolower(trim($validated['email']));

        $user = User::create([
            'name' => $validated['name'],
            'email' => $email,
            'password' => $validated['password'], // ✅ User model casts password => hashed
            'role' => User::ROLE_PATIENT,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return ApiResponse::ok([
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ], 'Registered successfully');
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $email = strtolower(trim($validated['email']));
        $password = $validated['password'];

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ApiResponse::error('Invalid credentials', [], 401);
        }

        // ✅ Case-insensitive lookup (reliable with SQLite)
        $user = User::whereRaw('LOWER(email) = ?', [$email])->first();

        if (!$user || !Hash::check($password, $user->password)) {
            return ApiResponse::error('Invalid credentials', [], 401);
        }

        // optional: clean tokens
        $user->tokens()->delete();

        $token = $user->createToken('api')->plainTextToken;

        return ApiResponse::ok([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'token' => $token,
            'token_type' => 'Bearer',
        ], 'Logged in');
    }

    public function me(Request $request)
    {
        $user = $request->user();

        return ApiResponse::ok([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ], 'OK');
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();
        return ApiResponse::ok(null, 'Logged out');
    }
}