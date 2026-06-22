<?php

namespace App\Services\Crm\Analytics\Segmentation;

use Illuminate\Support\Collection;

readonly class SegmentationResult
{
    public function __construct(
        public int $count,
        public int $total,
        public float $percentage,
        public int $evaluated,
        public Collection $items,
    ) {}
}
