<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\FaqEntry;

class FaqSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            [
                'question' => 'شو الفرق بين pending و confirmed؟',
                'answer' => 'pending يعني الموعد تم طلبه ولسا الطبيب ما أكّده. confirmed يعني الطبيب أكّد الموعد وصار ثابت.',
                'tags' => 'status,pending,confirmed,appointments',
                'scope' => 'general',
                'priority' => 10,
                'is_active' => true,
            ],
            [
                'question' => 'كيف أغير الموعد؟',
                'answer' => 'حاليًا تغيير الموعد بيكون عبر إلغاء الموعد الحالي ثم حجز Slot جديد.',
                'tags' => 'reschedule,cancel,booking',
                'scope' => 'patient',
                'priority' => 9,
                'is_active' => true,
            ],
        ];

        foreach ($items as $item) {
            FaqEntry::updateOrCreate(
                ['question' => $item['question'], 'scope' => $item['scope']],
                $item
            );
        }
    }
}