<?php

use App\Models\CrmLead;
use App\Models\CrmOrganization;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        CrmLead::query()
            ->whereNotNull('company')
            ->where('company', '!=', '')
            ->whereNull('organization_id')
            ->chunkById(100, function ($leads) {
                foreach ($leads as $lead) {
                    $org = CrmOrganization::firstOrCreate(
                        ['name' => $lead->company],
                        [
                            'domain' => $this->domainFromEmail($lead->email),
                            'created_by' => 1,
                        ]
                    );
                    $lead->organization_id = $org->id;
                    $lead->saveQuietly();
                }
            });
    }

    public function down(): void
    {
        // Not reversible — data migration
    }

    private function domainFromEmail(?string $email): ?string
    {
        if (! $email || ! str_contains($email, '@')) {
            return null;
        }

        $parts = explode('@', $email);

        return $parts[1] ?? null;
    }
};
