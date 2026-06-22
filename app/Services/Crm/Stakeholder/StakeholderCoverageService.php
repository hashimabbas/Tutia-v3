<?php

namespace App\Services\Crm\Stakeholder;

use App\Models\CrmContact;
use App\Models\CrmDeal;
use Illuminate\Support\Collection;

class StakeholderCoverageService
{
    private const WEIGHTS = [
        'decision_maker' => 40,
        'champion' => 30,
        'influencer' => 15,
        'blocker' => 15,
    ];

    public function calculateForDeal(CrmDeal $deal): StakeholderCoverageResult
    {
        $contacts = $this->resolveContacts($deal);

        $hasDM = $this->hasInfluence($contacts, 'decision_maker');
        $hasChampion = $this->hasInfluence($contacts, 'champion');
        $hasInfluencer = $this->hasInfluence($contacts, 'influencer');
        $hasBlocker = $this->hasInfluence($contacts, 'blocker');

        $score = 0;
        $factors = [];

        if ($hasDM) {
            $score += self::WEIGHTS['decision_maker'];
            $factors[] = ['name' => 'Decision Maker identified', 'weight' => self::WEIGHTS['decision_maker'], 'score' => self::WEIGHTS['decision_maker']];
        } else {
            $factors[] = ['name' => 'Decision Maker identified', 'weight' => self::WEIGHTS['decision_maker'], 'score' => 0];
        }

        if ($hasChampion) {
            $score += self::WEIGHTS['champion'];
            $factors[] = ['name' => 'Champion identified', 'weight' => self::WEIGHTS['champion'], 'score' => self::WEIGHTS['champion']];
        } else {
            $factors[] = ['name' => 'Champion identified', 'weight' => self::WEIGHTS['champion'], 'score' => 0];
        }

        if ($hasInfluencer) {
            $score += self::WEIGHTS['influencer'];
            $factors[] = ['name' => 'Influencer identified', 'weight' => self::WEIGHTS['influencer'], 'score' => self::WEIGHTS['influencer']];
        } else {
            $factors[] = ['name' => 'Influencer identified', 'weight' => self::WEIGHTS['influencer'], 'score' => 0];
        }

        // Blocker known is positive even if present — awareness matters
        if ($hasBlocker) {
            $score += self::WEIGHTS['blocker'];
            $factors[] = ['name' => 'Blocker known', 'weight' => self::WEIGHTS['blocker'], 'score' => self::WEIGHTS['blocker']];
        } else {
            $factors[] = ['name' => 'Blocker known', 'weight' => self::WEIGHTS['blocker'], 'score' => 0];
        }

        return new StakeholderCoverageResult(
            score: min($score, 100),
            hasDecisionMaker: $hasDM,
            hasChampion: $hasChampion,
            hasInfluencer: $hasInfluencer,
            hasBlocker: $hasBlocker,
            factors: $factors,
        );
    }

    private function resolveContacts(CrmDeal $deal): Collection
    {
        $contacts = collect();

        if ($deal->relationLoaded('organization') && $deal->organization) {
            $org = $deal->organization;
            if ($org->relationLoaded('contacts')) {
                $contacts = $contacts->concat($org->contacts);
            }
        }

        if ($deal->contact) {
            $contacts->push($deal->contact);
        }

        return $contacts->unique('id');
    }

    private function hasInfluence(Collection $contacts, string $slug): bool
    {
        return $contacts->contains(function (CrmContact $contact) use ($slug) {
            return $contact->relationLoaded('influenceType')
                && $contact->influenceType?->slug === $slug;
        });
    }
}
