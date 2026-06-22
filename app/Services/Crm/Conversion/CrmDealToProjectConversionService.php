<?php

namespace App\Services\Crm\Conversion;

use App\Events\Crm\DealConvertedToProject;
use App\Events\Crm\ProjectCreated;
use App\Models\CrmActivity;
use App\Models\CrmDeal;
use App\Models\CrmDeliverable;
use App\Models\CrmMilestone;
use App\Models\CrmProject;
use App\Models\CrmProjectMember;
use App\Models\CrmProjectStakeholder;
use App\Models\CrmProjectTemplate;
use App\Models\User;
use App\Services\CrmAuditLogService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class CrmDealToProjectConversionService
{
    public function __construct(
        private readonly ConversionEligibilityPolicy $eligibility,
        private readonly CrmAuditLogService $audit,
    ) {}

    public function convert(CrmDeal $deal, User $convertedBy, ?int $templateId = null, ?string $startDate = null, ?string $targetEndDate = null): ProjectConversionResult
    {
        $this->eligibility->validateOrFail($deal);

        $deal->loadMissing(['organization', 'contact', 'quotations.items.product']);

        $template = $this->resolveTemplate($deal, $templateId);

        $warnings = [];

        return DB::transaction(function () use ($deal, $convertedBy, $template, $startDate, $targetEndDate, &$warnings) {
            $deal->update(['converted_to_project_at' => now()]);

            $project = CrmProject::create([
                'deal_id' => $deal->id,
                'organization_id' => $deal->organization_id,
                'template_id' => $template?->id,
                'name' => $deal->title,
                'status' => 'planned',
                'contract_value' => $deal->value,
                'start_date' => $startDate,
                'target_end_date' => $targetEndDate,
                'created_by' => $convertedBy->id,
            ]);

            $this->createActivity($deal, 'deal_converted_to_project', 'Deal converted to project', "Deal \"{$deal->title}\" was converted to project \"{$project->name}\".", $convertedBy);

            $this->createActivityForProject($project, 'project_created', 'Project created', "Project \"{$project->name}\" was created from deal \"{$deal->title}\".", $convertedBy);

            [$milestonesCreated, $deliverablesCreated] = $this->applyTemplate($project, $template, $startDate, $convertedBy);

            $stakeholdersCreated = $this->migrateStakeholders($deal, $project, $convertedBy);

            $this->migrateOwnerAsMember($deal, $project, $convertedBy);

            $productsMapped = $this->countProductsFromAcceptedQuotation($deal);

            if ($template) {
                $this->createActivityForProject($project, 'template_applied', 'Template applied', "Template \"{$template->name}\" was applied to project \"{$project->name}\".", $convertedBy);
            }

            if ($stakeholdersCreated > 0) {
                $this->createActivityForProject($project, 'stakeholders_migrated', 'Stakeholders migrated', "{$stakeholdersCreated} stakeholder(s) were migrated from deal to project.", $convertedBy);
            }

            $this->audit->log(
                $deal,
                'converted_to_project',
                null,
                ['project_id' => $project->id, 'template_id' => $template?->id, 'converted_by' => $convertedBy->id],
            );

            $project->loadMissing(['milestones', 'stakeholders', 'members']);

            DealConvertedToProject::dispatch($deal, $project->id, $convertedBy, $template?->id);
            ProjectCreated::dispatch($project, $convertedBy, $milestonesCreated, $deliverablesCreated, $stakeholdersCreated, $productsMapped);

            return new ProjectConversionResult(
                project_id: $project->id,
                project: $project,
                milestones_created: $milestonesCreated,
                deliverables_created: $deliverablesCreated,
                stakeholders_created: $stakeholdersCreated,
                products_mapped: $productsMapped,
                warnings: $warnings,
            );
        });
    }

    private function resolveTemplate(CrmDeal $deal, ?int $templateId): ?CrmProjectTemplate
    {
        if ($templateId !== null) {
            return CrmProjectTemplate::with(['templateMilestones.templateDeliverables'])->find($templateId);
        }

        $productCategory = $this->resolveProductCategory($deal);

        if ($productCategory !== null) {
            $template = CrmProjectTemplate::with(['templateMilestones.templateDeliverables'])
                ->active()
                ->byCategory($productCategory)
                ->first();

            if ($template !== null) {
                return $template;
            }
        }

        return CrmProjectTemplate::with(['templateMilestones.templateDeliverables'])
            ->active()
            ->byCategory('consulting')
            ->first();
    }

    private function resolveProductCategory(CrmDeal $deal): ?string
    {
        $acceptedQuotation = $deal->quotations()
            ->where('status', 'accepted')
            ->latest('version')
            ->first();

        if ($acceptedQuotation === null) {
            $acceptedQuotation = $deal->quotations()
                ->latest('version')
                ->first();
        }

        if ($acceptedQuotation === null) {
            return null;
        }

        $acceptedQuotation->loadMissing(['items.product']);

        $categories = $acceptedQuotation->items
            ->filter(fn ($item) => $item->product !== null)
            ->groupBy(fn ($item) => $item->product->category)
            ->map->count();

        if ($categories->isEmpty()) {
            return null;
        }

        return $categories->sortDesc()->keys()->first();
    }

    private function applyTemplate(CrmProject $project, ?CrmProjectTemplate $template, ?string $startDate, User $convertedBy): array
    {
        if ($template === null) {
            $this->createActivityForProject($project, 'milestone_created', 'No template applied', 'Project was created without a template. Add milestones manually.', $convertedBy);

            return [0, 0];
        }

        $milestonesCreated = 0;
        $deliverablesCreated = 0;
        $currentStart = $startDate ? Carbon::parse($startDate) : now();

        foreach ($template->templateMilestones->sortBy('sort_order') as $tplMilestone) {
            $endDate = $currentStart->copy()->addDays($tplMilestone->default_duration_days);

            $milestone = CrmMilestone::create([
                'project_id' => $project->id,
                'name' => $tplMilestone->name,
                'description' => $tplMilestone->description,
                'status' => 'pending',
                'start_date' => $currentStart->toDateString(),
                'end_date' => $endDate->toDateString(),
                'sort_order' => $tplMilestone->sort_order,
            ]);

            $milestonesCreated++;

            foreach ($tplMilestone->templateDeliverables->sortBy('sort_order') as $tplDeliverable) {
                CrmDeliverable::create([
                    'milestone_id' => $milestone->id,
                    'name' => $tplDeliverable->name,
                    'description' => $tplDeliverable->description,
                    'status' => 'pending',
                    'sort_order' => $tplDeliverable->sort_order,
                ]);

                $deliverablesCreated++;
            }

            $this->createActivityForProject($project, 'milestone_created', 'Milestone created', "Milestone \"{$tplMilestone->name}\" created with {$tplMilestone->templateDeliverables->count()} deliverable(s).", $convertedBy);

            $currentStart = $endDate;
        }

        return [$milestonesCreated, $deliverablesCreated];
    }

    private function migrateStakeholders(CrmDeal $deal, CrmProject $project, User $convertedBy): int
    {
        $contacts = collect();

        if ($deal->relationLoaded('organization') && $deal->organization) {
            $contacts = $contacts->concat($deal->organization->contacts);
        }

        if ($deal->contact) {
            $contacts->push($deal->contact);
        }

        $contacts = $contacts->unique('id');

        $created = 0;

        foreach ($contacts as $contact) {
            $influenceSlug = $contact->influenceType?->slug;

            $projectRole = match ($influenceSlug) {
                'decision_maker' => 'sponsor',
                'champion' => 'point_of_contact',
                'influencer' => 'technical_reviewer',
                'blocker' => 'team_member',
                default => 'team_member',
            };

            CrmProjectStakeholder::create([
                'project_id' => $project->id,
                'contact_id' => $contact->id,
                'derived_from_deal_id' => $deal->id,
                'project_role' => $projectRole,
                'influence_type_at_conversion' => $influenceSlug,
                'is_active' => true,
            ]);

            $created++;
        }

        return $created;
    }

    private function migrateOwnerAsMember(CrmDeal $deal, CrmProject $project, User $convertedBy): void
    {
        if ($deal->owner_id === null) {
            return;
        }

        $exists = CrmProjectMember::where('project_id', $project->id)
            ->where('user_id', $deal->owner_id)
            ->exists();

        if (! $exists) {
            CrmProjectMember::create([
                'project_id' => $project->id,
                'user_id' => $deal->owner_id,
                'role' => 'project_manager',
                'assigned_at' => now(),
            ]);
        }
    }

    private function countProductsFromAcceptedQuotation(CrmDeal $deal): int
    {
        $quotation = $deal->quotations()
            ->where('status', 'accepted')
            ->latest('version')
            ->first();

        if ($quotation === null) {
            return 0;
        }

        return $quotation->items()->whereNotNull('product_id')->count();
    }

    private function createActivity(CrmDeal $deal, string $type, string $subject, string $description, User $user): void
    {
        CrmActivity::create([
            'activitable_type' => $deal->getMorphClass(),
            'activitable_id' => $deal->id,
            'type' => $type,
            'subject' => $subject,
            'description' => $description,
            'created_by' => $user->id,
        ]);
    }

    private function createActivityForProject(CrmProject $project, string $type, string $subject, string $description, User $user): void
    {
        CrmActivity::create([
            'activitable_type' => $project->getMorphClass(),
            'activitable_id' => $project->id,
            'type' => $type,
            'subject' => $subject,
            'description' => $description,
            'created_by' => $user->id,
        ]);
    }
}
