<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_approval_flows', function (Blueprint $table) {
            $table->id();
            $table->string('name', 200);
            $table->text('description')->nullable();
            $table->string('strategy', 30)->default('all_must_approve');
            $table->string('escalation_model', 20)->default('none');
            $table->json('escalation_config')->nullable();
            $table->unsignedSmallInteger('sla_warning_minutes')->nullable();
            $table->unsignedSmallInteger('sla_breach_minutes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('is_active', 'apr_flows_active_idx');
            $table->index('strategy', 'apr_flows_strategy_idx');
        });

        Schema::create('crm_approval_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('approval_flow_id')->constrained('crm_approval_flows')->cascadeOnDelete();
            $table->unsignedTinyInteger('step_order');
            $table->string('approver_type', 20);
            $table->unsignedBigInteger('approver_id')->nullable();
            $table->boolean('required')->default(true);
            $table->timestamps();

            $table->index('approval_flow_id', 'apr_steps_flow_idx');
            $table->index('approver_type', 'apr_steps_type_idx');
        });

        Schema::create('crm_approval_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('approval_flow_id')->constrained('crm_approval_flows');
            $table->foreignId('workflow_run_id')->constrained('crm_workflow_runs');
            $table->string('entity_type', 50);
            $table->unsignedBigInteger('entity_id');
            $table->string('status', 20)->default('pending');
            $table->foreignId('requested_by')->constrained('users');
            $table->timestamp('requested_at')->useCurrent();
            $table->timestamp('sla_warning_sent_at')->nullable();
            $table->timestamp('sla_breach_at')->nullable();
            $table->timestamp('escalated_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('approval_flow_id', 'apr_reqs_flow_idx');
            $table->index('workflow_run_id', 'apr_reqs_run_idx');
            $table->index(['entity_type', 'entity_id'], 'apr_reqs_entity_idx');
            $table->index('status', 'apr_reqs_status_idx');
        });

        Schema::create('crm_approval_decisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('approval_request_id')->constrained('crm_approval_requests')->cascadeOnDelete();
            $table->foreignId('approval_step_id')->constrained('crm_approval_steps');
            $table->foreignId('user_id')->constrained('users');
            $table->string('decision', 20);
            $table->text('comment')->nullable();
            $table->timestamp('decided_at')->useCurrent();
            $table->timestamps();

            $table->index('approval_request_id', 'apr_decisions_req_idx');
            $table->index('approval_step_id', 'apr_decisions_step_idx');
            $table->index('user_id', 'apr_decisions_user_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_approval_decisions');
        Schema::dropIfExists('crm_approval_requests');
        Schema::dropIfExists('crm_approval_steps');
        Schema::dropIfExists('crm_approval_flows');
    }
};
