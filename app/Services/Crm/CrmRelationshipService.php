<?php

namespace App\Services\Crm;

use App\Models\CrmOrganization;
use Illuminate\Support\Collection;

class CrmRelationshipService
{
    public function getOrganizationGraph(CrmOrganization $org): array
    {
        $contacts = $org->contacts()->withPivot(['contact_role_id', 'is_primary'])->get();

        $nodes = $contacts->map(fn ($contact) => [
            'id' => $contact->id,
            'name' => $contact->getNameAttribute(),
            'influence_type' => $contact->influenceType?->slug,
            'influence_type_name' => $contact->influenceType?->name,
            'avatar_url' => $contact->avatar_url,
            'is_primary' => (bool) $contact->pivot->is_primary,
            'org_role' => $contact->pivot->contact_role_id,
        ]);

        $edges = $this->buildEdges($org, $contacts);

        $influenceSummary = [];
        $influenceTypes = $contacts->pluck('influenceType')->filter();
        foreach ($influenceTypes as $type) {
            $slug = $type->slug;
            if (! isset($influenceSummary[$slug])) {
                $influenceSummary[$slug] = 0;
            }
            $influenceSummary[$slug]++;
        }

        $orgRelationships = $org->relationshipsAsSource()->with('type', 'target')->get();
        $incomingRelationships = $org->relationshipsAsTarget()->with('type', 'source')->get();

        $relationshipEdges = collect();
        foreach ($orgRelationships as $rel) {
            $relationshipEdges->push([
                'source_id' => $org->id,
                'target_id' => $rel->target_id,
                'target_name' => $rel->target->name,
                'type' => $rel->type->slug,
                'type_name' => $rel->type->name,
                'strength' => $rel->strength,
                'notes' => $rel->notes,
            ]);
        }
        foreach ($incomingRelationships as $rel) {
            $relationshipEdges->push([
                'source_id' => $rel->source_id,
                'target_id' => $org->id,
                'source_name' => $rel->source->name,
                'type' => $rel->type->slug,
                'type_name' => $rel->type->name,
                'strength' => $rel->strength,
                'notes' => $rel->notes,
            ]);
        }

        return [
            'nodes' => $nodes,
            'edges' => $edges,
            'influence_summary' => $influenceSummary,
            'organization_relationships' => $relationshipEdges,
        ];
    }

    private function buildEdges(CrmOrganization $org, Collection $contacts): array
    {
        $edges = [];
        $dealContacts = $org->deals()->with('contact')->get()->pluck('contact')->filter();

        foreach ($contacts as $contact) {
            $dealCount = $dealContacts->where('id', $contact->id)->count();
            $activityCount = $contact->activities()
                ->where('activitable_type', $org->getMorphClass())
                ->count();

            $weight = min(($dealCount * 30) + ($activityCount * 10), 100);

            if ($weight > 0) {
                $edges[] = [
                    'from' => $contact->id,
                    'to' => 'org_'.$org->id,
                    'weight' => $weight,
                    'label' => $dealCount > 0 ? "{$dealCount} deals" : null,
                ];
            }
        }

        return $edges;
    }
}
