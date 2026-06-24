<?php

namespace App\Http\Controllers;

use App\Models\Specialty;
use Illuminate\Http\JsonResponse;

class SpecialtyController extends Controller
{
    public function index(): JsonResponse
    {
        $items = Specialty::query()
            ->orderBy('name')
            ->get(['id', 'name']);

        return response()->json([
            "data" => $items
        ]);
    }
}
