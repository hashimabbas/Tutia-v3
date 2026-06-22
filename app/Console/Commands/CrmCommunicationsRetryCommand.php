<?php

namespace App\Console\Commands;

use App\Jobs\SendEmailNotification;
use App\Jobs\SendPortalNotification;
use App\Jobs\SendSmsNotification;
use App\Jobs\SendWhatsAppNotification;
use App\Models\CrmCommunicationLog;
use App\Models\CrmPortalAccount;
use App\Services\Crm\Communications\NotificationInstruction;
use App\Services\Crm\Communications\RecipientTarget;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

#[Signature('crm:communications:retry {--correlation-id=} {--channel=}')]
#[Description('Retry failed communication deliveries')]
class CrmCommunicationsRetryCommand extends Command
{
    public function handle(): int
    {
        $query = CrmCommunicationLog::where('status', 'failed');

        if ($this->option('correlation-id')) {
            $query->where('correlation_id', $this->option('correlation-id'));
        }

        if ($this->option('channel')) {
            $query->where('channel', $this->option('channel'));
        }

        $logs = $query->get();

        if ($logs->isEmpty()) {
            $this->info('No failed communications found.');

            return self::SUCCESS;
        }

        $grouped = $logs->groupBy('correlation_id');

        $retried = 0;

        foreach ($grouped as $correlationId => $group) {
            $first = $group->first();
            $instructionData = $first->provider_response ?? [];

            $recipients = $group->unique('portal_account_id')->map(function ($log) {
                $account = CrmPortalAccount::find($log->portal_account_id);

                return new RecipientTarget(
                    portalAccountId: $log->portal_account_id,
                    email: $account?->email_snapshot ?? '',
                    locale: $log->provider_response['recipient_locale'] ?? 'en',
                );
            })->values()->all();

            $instruction = new NotificationInstruction(
                event: $instructionData['event'] ?? 'unknown',
                template: $first->template,
                channels: $group->pluck('channel')->unique()->values()->all(),
                recipients: $recipients,
                payload: $instructionData['payload'] ?? [],
                correlationId: $correlationId,
                idempotencyKey: $instructionData['idempotency_key'] ?? (string) Str::uuid(),
            );

            foreach ($group->unique('channel') as $log) {
                $job = match ($log->channel) {
                    'email' => new SendEmailNotification($instruction),
                    'whatsapp' => new SendWhatsAppNotification($instruction),
                    'sms' => new SendSmsNotification($instruction),
                    'portal' => new SendPortalNotification($instruction),
                    default => null,
                };

                if ($job !== null) {
                    dispatch($job);
                    $retried++;
                }
            }

            CrmCommunicationLog::where('correlation_id', $correlationId)
                ->where('status', 'failed')
                ->update(['status' => 'queued', 'error_message' => null]);
        }

        $this->info("Retried {$retried} failed communication(s).");

        return self::SUCCESS;
    }
}
