<?php

namespace App\Services\Crm\Projects\Health\Contributors;

use App\Models\CrmProject;

class CustomerSentimentContributor implements ContributorInterface
{
    private const SENTIMENT_SCORES = [
        'positive' => 10,
        'neutral' => 5,
        'negative' => 0,
    ];

    public function calculate(CrmProject $project): array
    {
        $sentiment = $project->customer_sentiment;
        $score = self::SENTIMENT_SCORES[$sentiment] ?? 5;

        return [
            'name' => 'Customer Sentiment',
            'key' => 'customer_sentiment',
            'label' => 'Customer Sentiment',
            'weight' => 10,
            'max_score' => 10,
            'score' => $score,
            'details' => ['sentiment' => $sentiment ?? 'unset'],
        ];
    }
}
