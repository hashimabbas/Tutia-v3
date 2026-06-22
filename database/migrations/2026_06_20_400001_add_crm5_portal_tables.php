<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // === Portal Identity ===

        Schema::create('crm_portal_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contact_id')->constrained('crm_contacts')->cascadeOnDelete();
            $table->timestamp('enabled_at')->nullable();
            $table->foreignId('enabled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('last_login_at')->nullable();
            $table->unsignedInteger('login_count')->default(0);
            $table->string('locale', 10)->default('ar');
            $table->timestamp('disabled_at')->nullable();
            $table->string('disabled_reason', 200)->nullable();
            $table->string('email_snapshot', 255)->nullable();
            $table->string('name_snapshot', 255)->nullable();
            $table->timestamps();

            $table->unique('contact_id', 'crm_pa_contact_idx');
        });

        Schema::create('crm_portal_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('portal_account_id')->constrained('crm_portal_accounts')->cascadeOnDelete();
            $table->string('token_hash', 64)->unique('crm_pt_token_hash_idx');
            $table->string('type', 20);
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('used_at')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            $table->index('portal_account_id', 'crm_pt_account_idx');
        });

        Schema::create('crm_portal_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('portal_account_id')->constrained('crm_portal_accounts')->cascadeOnDelete();
            $table->string('token_hash', 64)->unique('crm_ps_token_hash_idx');
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->string('revoked_reason', 100)->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            $table->index('portal_account_id', 'crm_ps_account_idx');
        });

        // === Portal Notifications ===

        Schema::create('crm_portal_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('portal_account_id')->constrained('crm_portal_accounts')->cascadeOnDelete();
            $table->string('type', 50);
            $table->string('title', 200);
            $table->text('body')->nullable();
            $table->morphs('notifiable');
            $table->string('idempotency_key', 100)->unique('crm_pn_idempotency_idx');
            $table->json('metadata')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['portal_account_id', 'read_at'], 'crm_pn_acct_read_idx');
        });

        // === Portal Notification Preferences ===

        Schema::create('crm_portal_notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('portal_account_id')->constrained('crm_portal_accounts')->cascadeOnDelete();
            $table->string('channel', 20);
            $table->string('frequency', 20)->default('immediate');
            $table->json('event_filters')->nullable();
            $table->timestamps();

            $table->unique(['portal_account_id', 'channel'], 'crm_pnp_account_channel_uq');
        });

        // === Communication Delivery Tracking ===

        Schema::create('crm_communication_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('portal_account_id')->constrained('crm_portal_accounts')->cascadeOnDelete();
            $table->string('correlation_id', 100);
            $table->foreignId('event_id')->nullable()->constrained('crm_activities')->nullOnDelete();
            $table->string('channel', 20);
            $table->string('template', 100);
            $table->string('status', 20);
            $table->string('provider_message_id', 200)->nullable();
            $table->json('provider_response')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('clicked_at')->nullable();
            $table->timestamps();

            $table->index('correlation_id', 'crm_cl_correlation_idx');
            $table->index(['portal_account_id', 'status'], 'crm_cl_account_status_idx');
            $table->index('created_at', 'crm_cl_created_idx');
        });

        // === Project-Account Assignment ===

        Schema::create('crm_portal_account_project', function (Blueprint $table) {
            $table->id();
            $table->foreignId('portal_account_id')->constrained('crm_portal_accounts')->cascadeOnDelete();
            $table->foreignId('project_id')->constrained('crm_projects')->cascadeOnDelete();
            $table->string('role', 30)->default('viewer');
            $table->timestamps();

            $table->unique(['portal_account_id', 'project_id'], 'crm_pap_account_project_uq');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_portal_account_project');
        Schema::dropIfExists('crm_communication_logs');
        Schema::dropIfExists('crm_portal_notification_preferences');
        Schema::dropIfExists('crm_portal_notifications');
        Schema::dropIfExists('crm_portal_sessions');
        Schema::dropIfExists('crm_portal_tokens');
        Schema::dropIfExists('crm_portal_accounts');
    }
};
