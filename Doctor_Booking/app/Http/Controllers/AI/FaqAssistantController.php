<?php

namespace App\Http\Controllers\AI;

use App\Http\Controllers\Controller;
use App\Services\Faq\FaqSearchService;
use Illuminate\Http\Request;
use App\Support\ApiResponse;

class FaqAssistantController extends Controller
{
    public function __construct(private FaqSearchService $faqSearch) {}

    public function ask(Request $request)
    {
        try {
            $validated = $request->validate([
                'message' => ['required', 'string', 'min:2', 'max:500'],
            ]);

            $user = $request->user();
            $scope = data_get($user, 'role', 'general');

            $matches = $this->faqSearch->search($validated['message'], $scope, 5);

            if (empty($matches)) {
                return ApiResponse::ok([
                    'reply' => 'ما لقيت جواب مباشر. جرّب تسأل عن: الحجز، تغيير الموعد، حالات الموعد.',
                    'matches' => [],
                ], 'OK');
            }

            return ApiResponse::ok([
                'reply' => $matches[0]['answer'],
                'matches' => $matches,
            ], 'OK');
        } catch (\Throwable $e) {
    \Log::error('FAQ assistant error', [
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
    ]);

    // ✅ في local فقط: رجّع السبب للفرونت عشان نصلّحه بسرعة
    if (config('app.debug')) {
        return response()->json([
            'message' => 'Server error',
            'debug' => [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ],
        ], 500);
    }

    // ✅ production
    return response()->json([
        'message' => 'Server error',
    ], 500);
}
    }
}