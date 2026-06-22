<?php

namespace App\Services\Crm\Workflows\Debug;

readonly class WorkflowFailureExplainer
{
    public function __construct(
        public string $expression,
        public array $trace,
        public int $evaluatedRules,
        public int $passedRules,
        public bool $passed,
    ) {}

    public function summary(): string
    {
        if ($this->passed) {
            return 'All expression rules passed.';
        }

        $failed = $this->failedTraces();

        if (empty($failed)) {
            return 'Workflow failed for an unknown reason.';
        }

        if (count($failed) === 1) {
            $rule = $failed[0];

            return sprintf(
                'Workflow stopped because %s expected %s but actual value was %s.',
                $rule['rule'],
                $this->formatValue($rule['expected']),
                $this->formatValue($rule['actual']),
            );
        }

        $first = $failed[0];
        $remaining = count($failed) - 1;

        return sprintf(
            'Workflow failed: %s expected %s but got %s (and %d more rule%s failed).',
            $first['rule'],
            $this->formatValue($first['expected']),
            $this->formatValue($first['actual']),
            $remaining,
            $remaining === 1 ? '' : 's',
        );
    }

    public function failedRules(): array
    {
        return array_map(fn (array $t) => $this->formatFailure($t), $this->failedTraces());
    }

    public function skippedRules(): array
    {
        $traceRules = array_map(fn (array $t) => $t['rule'], $this->trace);
        $allComparisons = $this->extractComparisons($this->expression);

        $skipped = [];
        foreach ($allComparisons as $comparison) {
            if (! in_array($comparison, $traceRules, true)) {
                $skipped[] = [
                    'rule' => $comparison,
                    'reason' => 'Short-circuit: previous condition determined the result before this rule was evaluated.',
                ];
            }
        }

        return $skipped;
    }

    private function failedTraces(): array
    {
        return array_values(array_filter($this->trace, fn (array $t) => $t['passed'] === false));
    }

    private function formatFailure(array $trace): array
    {
        return [
            'rule' => $trace['rule'],
            'ruleId' => $trace['ruleId'] ?? '',
            'field' => $trace['field'],
            'operator' => $trace['operator'],
            'expected' => $trace['expected'],
            'actual' => $trace['actual'],
            'explanation' => sprintf(
                'Expected %s but received %s.',
                $this->formatValue($trace['expected']),
                $this->formatValue($trace['actual']),
            ),
        ];
    }

    private function formatValue(mixed $value): string
    {
        return match (true) {
            $value === null => 'null',
            is_bool($value) => $value ? 'true' : 'false',
            is_string($value) => '"'.$value.'"',
            default => (string) $value,
        };
    }

    private function extractComparisons(string $expression): array
    {
        preg_match_all(
            '/[A-Za-z_.]+(?:\s+(?:=|\!=|>=|<=|>|<|contains|starts_with|ends_with|in|not_in)\s+(?:"[^"]*"|\'[^\']*\'|[A-Za-z_0-9.]+))+/',
            $expression,
            $matches,
        );

        return array_map('trim', $matches[0] ?? []);
    }
}
