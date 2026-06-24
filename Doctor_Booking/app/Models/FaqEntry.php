<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FaqEntry extends Model
{
    protected $fillable = [
        'question', 'answer', 'tags', 'scope', 'is_active', 'priority',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}