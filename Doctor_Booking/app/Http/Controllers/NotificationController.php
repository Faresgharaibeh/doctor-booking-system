<?php

namespace App\Http\Controllers;

use App\Support\ApiResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // GET /api/notifications?per_page=10
    public function index(Request $request)
    {
        $validated = $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $perPage = $validated['per_page'] ?? 10;

        $p = $request->user()
            ->notifications()
            ->latest()
            ->paginate($perPage);

        return ApiResponse::ok([
            'items' => collect($p->items())->map(fn ($n) => [
                'id' => $n->id,
                'type' => $n->data['type'] ?? null,
                'title' => $n->data['title'] ?? null,
                'message' => $n->data['message'] ?? null,
                'action_url' => $n->data['action_url'] ?? null,
                'appointment_id' => $n->data['appointment_id'] ?? null,
                'date' => $n->data['date'] ?? null,
                'start_time' => $n->data['start_time'] ?? null,
                'end_time' => $n->data['end_time'] ?? null,
                'status' => $n->data['status'] ?? null,
                'read_at' => $n->read_at,
                'created_at' => $n->created_at?->toISOString(),
            ])->values(),
            'pagination' => [
                'page' => $p->currentPage(),
                'per_page' => $p->perPage(),
                'total' => $p->total(),
                'last_page' => $p->lastPage(),
            ],
        ], "OK");
    }

    // GET /api/notifications/unread
    public function unread(Request $request)
    {
        $items = $request->user()
            ->unreadNotifications()
            ->latest()
            ->take(20)
            ->get();

        return ApiResponse::ok([
            'items' => $items->map(fn ($n) => [
                'id' => $n->id,
                'type' => $n->data['type'] ?? null,
                'title' => $n->data['title'] ?? null,
                'message' => $n->data['message'] ?? null,
                'action_url' => $n->data['action_url'] ?? null,
                'created_at' => $n->created_at?->toISOString(),
            ])->values(),
            'count' => $items->count(),
        ], "OK");
    }

    // PATCH /api/notifications/{id}/read
    public function markAsRead(Request $request, string $id)
    {
        $n = $request->user()->notifications()->where('id', $id)->first();

        if (!$n) {
            return ApiResponse::error("Not found", [], 404);
        }

        $n->markAsRead();

        return ApiResponse::ok(null, "Marked as read");
    }

    // PATCH /api/notifications/read-all
    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();
        return ApiResponse::ok(null, "All marked as read");
    }
}