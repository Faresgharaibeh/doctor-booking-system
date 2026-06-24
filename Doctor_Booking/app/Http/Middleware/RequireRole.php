<?php

namespace App\Http\Middleware;

use App\Support\ApiResponse;
use Closure;
use Illuminate\Http\Request;

class RequireRole
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        if (!$user) {
            return ApiResponse::error('Unauthenticated', [], 401);
        }

        if (!in_array($user->role, $roles, true)) {
            return ApiResponse::error('Forbidden', [], 403);
        }

        return $next($request);
    }
}
