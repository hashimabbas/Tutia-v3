<?php

namespace App\Services\Crm;

use App\Models\CrmContact;
use App\Models\CrmDeal;
use App\Models\CrmLead;
use App\Models\CrmOrganization;
use Illuminate\Support\Collection;

class DuplicateResult
{
    public function __construct(
        public readonly string $entityType,
        public readonly int $entityId,
        public readonly string $name,
        public readonly ?string $email,
        public readonly int $confidence,
        public readonly array $matchedOn,
    ) {}
}

class CrmDuplicateDetectionService
{
    public const CONFIDENCE_EMAIL_EXACT = 98;

    public const CONFIDENCE_DOMAIN_EXACT = 95;

    public const CONFIDENCE_NAME_HIGH = 85;

    public const CONFIDENCE_NAME_MEDIUM = 65;

    public const CONFIDENCE_PHONE_EXACT = 90;

    public function findOrganizationDuplicates(string $name, ?string $domain = null, ?string $phone = null): Collection
    {
        $results = collect();
        $candidates = collect();

        $query = CrmOrganization::query();

        $query->where(function ($q) use ($name, $domain, $phone) {
            $q->where('name', 'like', "%{$name}%");
            if ($domain) {
                $q->orWhere('domain', $domain);
            }
            if ($phone) {
                $q->orWhere('phone', $phone);
            }
        });

        $candidates = $query->get();

        foreach ($candidates as $org) {
            $score = 0;
            $matchedOn = [];

            if ($domain && strcasecmp($org->domain ?? '', $domain) === 0) {
                $score = max($score, self::CONFIDENCE_DOMAIN_EXACT);
                $matchedOn[] = 'domain';
            }

            if ($phone && preg_replace('/\D/', '', $org->phone ?? '') === preg_replace('/\D/', '', $phone)) {
                $score = max($score, self::CONFIDENCE_PHONE_EXACT);
                $matchedOn[] = 'phone';
            }

            $similarity = $this->nameSimilarity($name, $org->name);
            if ($similarity > 0.8) {
                $score = max($score, self::CONFIDENCE_NAME_HIGH);
                $matchedOn[] = "name_{$similarity}";
            } elseif ($similarity > 0.6) {
                $score = max($score, self::CONFIDENCE_NAME_MEDIUM);
                $matchedOn[] = "name_{$similarity}";
            }

            if ($score > 0) {
                $results->push(new DuplicateResult(
                    entityType: 'organization',
                    entityId: $org->id,
                    name: $org->name,
                    email: null,
                    confidence: $score,
                    matchedOn: $matchedOn,
                ));
            }
        }

        return $results->sortByDesc('confidence')->values();
    }

    public function findContactDuplicates(
        string $email,
        ?string $firstName = null,
        ?string $lastName = null,
        ?string $phone = null,
    ): Collection {
        $results = collect();

        $query = CrmContact::query();

        $query->where(function ($q) use ($email, $firstName, $lastName, $phone) {
            $q->where('email', $email);
            if ($firstName && $lastName) {
                $q->orWhere(function ($sub) use ($firstName, $lastName) {
                    $sub->where('first_name', 'like', "%{$firstName}%")
                        ->where('last_name', 'like', "%{$lastName}%");
                });
            }
            if ($phone) {
                $q->orWhere('phone', $phone);
            }
        });

        $candidates = $query->get();

        foreach ($candidates as $contact) {
            $score = 0;
            $matchedOn = [];

            if (strcasecmp($contact->email ?? '', $email) === 0) {
                $score = max($score, self::CONFIDENCE_EMAIL_EXACT);
                $matchedOn[] = 'email';
            }

            if ($firstName && $lastName) {
                $firstSim = $this->nameSimilarity($firstName, $contact->first_name);
                $lastSim = $this->nameSimilarity($lastName, $contact->last_name);
                if ($firstSim > 0.8 && $lastSim > 0.8) {
                    $score = max($score, self::CONFIDENCE_NAME_HIGH);
                    $matchedOn[] = "name_{$firstSim}_{$lastSim}";
                } elseif ($firstSim > 0.6 || $lastSim > 0.6) {
                    $score = max($score, self::CONFIDENCE_NAME_MEDIUM);
                    $matchedOn[] = "name_{$firstSim}_{$lastSim}";
                }
            }

            if ($phone && preg_replace('/\D/', '', $contact->phone ?? '') === preg_replace('/\D/', '', $phone)) {
                $score = max($score, self::CONFIDENCE_PHONE_EXACT);
                $matchedOn[] = 'phone';
            }

            if ($score > 0) {
                $results->push(new DuplicateResult(
                    entityType: 'contact',
                    entityId: $contact->id,
                    name: $contact->getNameAttribute(),
                    email: $contact->email,
                    confidence: $score,
                    matchedOn: $matchedOn,
                ));
            }
        }

        return $results->sortByDesc('confidence')->values();
    }

    private function nameSimilarity(string $a, string $b): float
    {
        $a = mb_strtolower(trim($a));
        $b = mb_strtolower(trim($b));

        if ($a === $b) {
            return 1.0;
        }

        $lev = levenshtein($a, $b);
        $maxLen = max(mb_strlen($a), mb_strlen($b));

        if ($maxLen === 0) {
            return 1.0;
        }

        return 1 - ($lev / $maxLen);
    }

    public function mergeOrganizations(CrmOrganization $primary, CrmOrganization $duplicate): CrmOrganization
    {
        CrmLead::where('organization_id', $duplicate->id)->update(['organization_id' => $primary->id]);
        CrmDeal::where('organization_id', $duplicate->id)->update(['organization_id' => $primary->id]);

        foreach ($duplicate->contacts as $contact) {
            if (! $primary->contacts()->where('contact_id', $contact->id)->exists()) {
                $primary->contacts()->attach($contact->id, [
                    'contact_role_id' => $contact->pivot->contact_role_id,
                    'is_primary' => false,
                ]);
            }
        }

        foreach ($duplicate->activities as $activity) {
            $activity->update(['activitable_id' => $primary->id]);
        }

        if (! $primary->domain && $duplicate->domain) {
            $primary->update(['domain' => $duplicate->domain]);
        }

        $duplicate->delete();

        return $primary->fresh();
    }
}
