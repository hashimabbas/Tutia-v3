<?php

namespace App\Services\Crm;

use App\Models\CrmContact;
use App\Models\CrmImport;
use App\Models\CrmOrganization;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class CrmImportService
{
    public function importOrganizations(int $userId, array $rows, CrmImport $import): CrmImport
    {
        $import->update(['status' => 'processing']);

        $errors = [];
        $processed = 0;
        $failed = 0;

        foreach ($rows as $row) {
            $validator = Validator::make($row, [
                'name' => 'required|string|max:200',
                'domain' => 'nullable|string|max:200',
                'industry' => 'nullable|string|max:100',
                'phone' => 'nullable|string|max:50',
                'website' => 'nullable|string|max:200',
            ]);

            if ($validator->fails()) {
                $failed++;
                $errors[] = ['row' => $processed + 1, 'errors' => $validator->errors()->all()];
                $processed++;

                continue;
            }

            try {
                CrmOrganization::create(array_merge($validator->validated(), [
                    'created_by' => $userId,
                ]));
                $processed++;
            } catch (\Exception $e) {
                $failed++;
                $errors[] = ['row' => $processed + 1, 'errors' => [$e->getMessage()]];
                $processed++;
            }
        }

        $import->update([
            'status' => $failed > 0 ? 'completed' : 'completed',
            'processed_rows' => $processed,
            'failed_rows' => $failed,
            'errors' => $errors,
            'completed_at' => now(),
        ]);

        return $import->fresh();
    }

    public function importContacts(int $userId, array $rows, CrmImport $import): CrmImport
    {
        $import->update(['status' => 'processing']);

        $errors = [];
        $processed = 0;
        $failed = 0;

        foreach ($rows as $row) {
            $validator = Validator::make($row, [
                'first_name' => 'required|string|max:100',
                'last_name' => 'required|string|max:100',
                'email' => 'nullable|email|max:200',
                'phone' => 'nullable|string|max:50',
                'organization_name' => 'nullable|string|max:200',
            ]);

            if ($validator->fails()) {
                $failed++;
                $errors[] = ['row' => $processed + 1, 'errors' => $validator->errors()->all()];
                $processed++;

                continue;
            }

            try {
                DB::transaction(function () use ($validator, $userId, $row, &$processed) {
                    $contact = CrmContact::create(array_merge(
                        $validator->safe()->except(['organization_name']),
                        ['created_by' => $userId],
                    ));

                    if (! empty($row['organization_name'])) {
                        $org = CrmOrganization::firstOrCreate(
                            ['name' => $row['organization_name']],
                            ['created_by' => $userId],
                        );
                        $contact->organizations()->attach($org->id, ['is_primary' => true]);
                    }

                    $processed++;
                });
            } catch (\Exception $e) {
                $failed++;
                $errors[] = ['row' => $processed + 1, 'errors' => [$e->getMessage()]];
                $processed++;
            }
        }

        $import->update([
            'status' => 'completed',
            'processed_rows' => $processed,
            'failed_rows' => $failed,
            'errors' => $errors,
            'completed_at' => now(),
        ]);

        return $import->fresh();
    }
}
