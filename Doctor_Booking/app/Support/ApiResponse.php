<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    public static function serverError(string $message = 'Server error', array $data = [])
{
    return response()->json([
        'message' => $message,
        'data' => $data,
    ], 500);
}
public static function badRequest(string $message = 'Bad request', array $data = [])
{
    return response()->json([
        'message' => $message,
        'data' => $data,
    ], 400);
}
    public static function ok(mixed $data = null, string $message = 'OK', int $status = 200): JsonResponse
    {
        return response()->json([
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    public static function error(string $message, array $errors = [], int $status = 400): JsonResponse
    {
        return response()->json([
            'message' => $message,
            'errors' => (object) $errors, // keeps {} when empty
        ], $status);
    }
}
