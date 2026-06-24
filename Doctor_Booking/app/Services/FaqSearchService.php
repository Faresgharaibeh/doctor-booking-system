<?php
namespace App\Services\Faq;

use App\Models\FaqEntry;

class FaqSearchService
{
    public function search(string $query, string $scope = 'general', int $limit = 5): array
    {
        $q = trim(mb_strtolower($query));
        if ($q === '') return [];

        $entries = FaqEntry::query()
            ->where('is_active', true)
            ->whereIn('scope', [$scope, 'general'])
            ->orderByDesc('priority')
            ->get(['id','question','answer','tags','scope','priority']);

        $scored = $entries->map(function ($e) use ($q) {
            $hay = mb_strtolower($e->question.' '.$e->answer.' '.($e->tags ?? ''));
            $score = 0;

            if (str_contains($hay, $q)) $score += 10;

            $tokens = array_values(array_filter(preg_split('/\s+/u', $q)));
            foreach ($tokens as $t) {
                if (mb_strlen($t) < 3) continue;
                if (str_contains($hay, $t)) $score += 2;
            }

            return ['entry' => $e, 'score' => $score];
        })
        ->filter(fn($x) => $x['score'] > 0)
        ->sortByDesc('score')
        ->take($limit)
        ->values()
        ->all();

        return array_map(fn($x) => [
            'id' => $x['entry']->id,
            'question' => $x['entry']->question,
            'answer' => $x['entry']->answer,
            'score' => $x['score'],
            'scope' => $x['entry']->scope,
        ], $scored);
    }
}