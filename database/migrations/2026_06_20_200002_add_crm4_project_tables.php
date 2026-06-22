<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // === Configuration Tables ===

        Schema::create('crm_project_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category', 50);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique('name', 'crm_templates_name_unique');
        });

        Schema::create('crm_template_milestones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained('crm_project_templates')->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->unsignedSmallInteger('default_duration_days')->default(14);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['template_id', 'sort_order'], 'crm_tmpl_mstones_tmpl_sort_uq');
            $table->index('template_id', 'crm_tmpl_mstones_tmpl_idx');
        });

        Schema::create('crm_template_deliverables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_milestone_id')->constrained('crm_template_milestones')->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['template_milestone_id', 'sort_order'], 'crm_tmpl_delivs_tmpl_mstone_sort_uq');
            $table->index('template_milestone_id', 'crm_tmpl_delivs_mstone_idx');
        });

        // === Core Tables ===

        Schema::create('crm_projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deal_id')->nullable()->constrained('crm_deals')->nullOnDelete();
            $table->foreignId('organization_id')->constrained('crm_organizations')->cascadeOnDelete();
            $table->foreignId('template_id')->nullable()->constrained('crm_project_templates')->nullOnDelete();
            $table->string('name');
            $table->string('status', 20)->default('planned');
            $table->decimal('contract_value', 14, 2)->default(0);
            $table->decimal('change_order_total', 14, 2)->default(0);
            $table->decimal('billed_amount', 14, 2)->default(0);
            $table->decimal('collected_amount', 14, 2)->default(0);
            $table->date('start_date')->nullable();
            $table->date('target_end_date')->nullable();
            $table->date('actual_end_date')->nullable();
            $table->string('customer_sentiment', 10)->nullable();
            $table->string('visibility', 10)->default('internal');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('organization_id', 'crm_projects_org_idx');
            $table->index('deal_id', 'crm_projects_deal_idx');
            $table->index('status', 'crm_projects_status_idx');
            $table->index('template_id', 'crm_projects_tmpl_idx');
        });

        Schema::create('crm_milestones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('crm_projects')->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('status', 20)->default('pending');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->date('actual_end_date')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->foreignId('owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['project_id', 'sort_order'], 'crm_mstones_proj_sort_uq');
            $table->index('project_id', 'crm_mstones_proj_idx');
            $table->index('status', 'crm_mstones_status_idx');
        });

        Schema::create('crm_deliverables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('milestone_id')->constrained('crm_milestones')->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('status', 20)->default('pending');
            $table->date('due_date')->nullable();
            $table->foreignId('owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('acceptance_criteria')->nullable();
            $table->boolean('is_visible_to_customer')->default(true);
            $table->timestamp('customer_approved_at')->nullable();
            $table->string('customer_approved_by')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index('milestone_id', 'crm_delivs_mstone_idx');
            $table->index('status', 'crm_delivs_status_idx');
        });

        // === Supporting Tables ===

        Schema::create('crm_project_stakeholders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('crm_projects')->cascadeOnDelete();
            $table->foreignId('contact_id')->constrained('crm_contacts')->cascadeOnDelete();
            $table->foreignId('derived_from_deal_id')->nullable()->constrained('crm_deals')->nullOnDelete();
            $table->string('project_role', 30);
            $table->string('influence_type_at_conversion', 30)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['project_id', 'contact_id'], 'crm_pstake_proj_contact_uq');
            $table->index('project_id', 'crm_pstake_proj_idx');
            $table->index('contact_id', 'crm_pstake_contact_idx');
        });

        Schema::create('crm_project_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('crm_projects')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('role', 30);
            $table->unsignedSmallInteger('allocation_percent')->default(100);
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamp('unassigned_at')->nullable();
            $table->timestamps();

            $table->unique(['project_id', 'user_id', 'unassigned_at'], 'crm_pmember_proj_user_ua_uq');
            $table->index('project_id', 'crm_pmember_proj_idx');
            $table->index('user_id', 'crm_pmember_user_idx');
        });

        Schema::create('crm_project_risks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('crm_projects')->cascadeOnDelete();
            $table->text('description');
            $table->string('severity', 10)->default('medium');
            $table->string('probability', 10)->default('medium');
            $table->text('impact')->nullable();
            $table->string('status', 30)->default('identified');
            $table->foreignId('owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('mitigation_plan')->nullable();
            $table->timestamps();

            $table->index('project_id', 'crm_prix_proj_idx');
            $table->index('status', 'crm_prix_status_idx');
        });

        Schema::create('crm_issues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('crm_projects')->cascadeOnDelete();
            $table->text('description');
            $table->string('severity', 10)->default('major');
            $table->string('status', 20)->default('open');
            $table->foreignId('owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('resolution')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index('project_id', 'crm_issues_proj_idx');
            $table->index('status', 'crm_issues_status_idx');
        });

        Schema::create('crm_change_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('crm_projects')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status', 20)->default('identified');
            $table->decimal('cost_impact', 14, 2)->default(0);
            $table->smallInteger('timeline_impact_days')->default(0);
            $table->string('requested_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();

            $table->index('project_id', 'crm_co_proj_idx');
            $table->index('status', 'crm_co_status_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_change_orders');
        Schema::dropIfExists('crm_issues');
        Schema::dropIfExists('crm_project_risks');
        Schema::dropIfExists('crm_project_members');
        Schema::dropIfExists('crm_project_stakeholders');
        Schema::dropIfExists('crm_deliverables');
        Schema::dropIfExists('crm_milestones');
        Schema::dropIfExists('crm_projects');
        Schema::dropIfExists('crm_template_deliverables');
        Schema::dropIfExists('crm_template_milestones');
        Schema::dropIfExists('crm_project_templates');
    }
};
