<?php

namespace App\Services\Crm\Optimization\Automation\Services;

class ScoreClassificationService
{
    public function classify(float $score): string
    {
        return match (true) {
            $score >= 80 => 'excellent',
            $score >= 60 => 'good',
            $score >= 40 => 'fair',
            $score >= 20 => 'poor',
            default => 'critical',
        };
    }
}
