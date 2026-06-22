<?php

namespace App\Services\Crm\Conversion;

use App\Models\CrmProject;

class ProjectConversionResult
{
    public function __construct(
        public readonly int $project_id,
        public readonly CrmProject $project,
        public readonly int $milestones_created,
        public readonly int $deliverables_created,
        public readonly int $stakeholders_created,
        public readonly int $products_mapped,
        public readonly array $warnings = [],
    ) {}
}
