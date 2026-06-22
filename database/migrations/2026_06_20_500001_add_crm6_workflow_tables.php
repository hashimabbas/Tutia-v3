<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_workflows', function (Blueprint $table) {
            $table->id();
            $table->string('name', 200);
            $table->text('description')->nullable();
            $table->string('entity_type', 50);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('version')->default(1);
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();

            $table->index('entity_type', 'crm_wf_entity_idx');
            $table->index('is_active', 'crm_wf_active_idx');
        });

        Schema::create('crm_workflow_triggers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained('crm_workflows')->cascadeOnDelete();
            $table->string('event_key', 100);
            $table->timestamps();

            $table->index('event_key', 'crm_wft_event_idx');
            $table->index('workflow_id', 'crm_wft_wf_idx');
        });

        Schema::create('crm_workflow_conditions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained('crm_workflows')->cascadeOnDelete();
            $table->string('field', 100);
            $table->string('operator', 20);
            $table->text('value');
            $table->unsignedTinyInteger('group_order')->default(0);
            $table->timestamps();

            $table->index('workflow_id', 'crm_wfc_wf_idx');
        });

        Schema::create('crm_workflow_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained('crm_workflows')->cascadeOnDelete();
            $table->string('action_type', 50);
            $table->json('configuration_json');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('stop_on_fail')->default(false);
            $table->timestamps();

            $table->index('workflow_id', 'crm_wfa_wf_idx');
        });

        Schema::create('crm_workflow_runs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained('crm_workflows')->cascadeOnDelete();
            $table->string('event_key', 100);
            $table->string('entity_type', 50);
            $table->unsignedBigInteger('entity_id');
            $table->string('status', 20);
            $table->json('context_snapshot')->nullable();
            $table->string('correlation_id', 100)->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index('status', 'crm_wfr_status_idx');
            $table->index('entity_type', 'crm_wfr_entity_idx');
            $table->index('workflow_id', 'crm_wfr_wf_idx');
        });

        Schema::create('crm_workflow_action_runs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_run_id')->constrained('crm_workflow_runs')->cascadeOnDelete();
            $table->string('action_type', 50);
            $table->string('status', 20);
            $table->json('configuration_json');
            $table->json('response_json')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->index('workflow_run_id', 'crm_war_run_idx');
            $table->index('status', 'crm_war_status_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_workflow_action_runs');
        Schema::dropIfExists('crm_workflow_runs');
        Schema::dropIfExists('crm_workflow_actions');
        Schema::dropIfExists('crm_workflow_conditions');
        Schema::dropIfExists('crm_workflow_triggers');
        Schema::dropIfExists('crm_workflows');
    }
};
