<?php

use App\Services\Crm\Analytics\Segmentation\SegmentationResult;
use Illuminate\Support\Collection;

describe('SegmentationResult DTO', function () {
    it('creates a result with all properties', function () {
        $items = collect([
            ['id' => 1, 'name' => 'Wf A', 'score' => 90],
            ['id' => 2, 'name' => 'Wf B', 'score' => 30],
        ]);

        $result = new SegmentationResult(
            count: 1,
            total: 2,
            percentage: 50.0,
            evaluated: 2,
            items: $items,
        );

        expect($result->count)->toBe(1)
            ->and($result->total)->toBe(2)
            ->and($result->percentage)->toBe(50.0)
            ->and($result->evaluated)->toBe(2)
            ->and($result->items)->toHaveCount(2);
    });

    it('handles zero total gracefully', function () {
        $result = new SegmentationResult(
            count: 0,
            total: 0,
            percentage: 0.0,
            evaluated: 0,
            items: collect(),
        );

        expect($result->count)->toBe(0)
            ->and($result->total)->toBe(0)
            ->and($result->percentage)->toBe(0.0)
            ->and($result->items)->toBeEmpty();
    });

    it('handles 100% match', function () {
        $result = new SegmentationResult(
            count: 5,
            total: 5,
            percentage: 100.0,
            evaluated: 5,
            items: collect(range(1, 5)),
        );

        expect($result->percentage)->toBe(100.0);
    });

    it('is immutable', function () {
        $result = new SegmentationResult(
            count: 1, total: 2, percentage: 50.0, evaluated: 2, items: collect(),
        );

        expect(fn () => $result->count = 2)->toThrow(Error::class);
    });

    it('rounds percentage to one decimal place', function () {
        $result = new SegmentationResult(
            count: 1, total: 3, percentage: round((1 / 3) * 100, 1), evaluated: 2, items: collect(),
        );

        expect($result->percentage)->toBe(33.3);
    });
});
