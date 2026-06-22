<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('crm_project_risks', function (Blueprint $table) {
            $table->boolean('is_visible_to_customer')->default(false)->after('mitigation_plan');
        });

        Schema::table('crm_issues', function (Blueprint $table) {
            $table->boolean('is_visible_to_customer')->default(false)->after('resolution');
        });

        Schema::table('crm_activities', function (Blueprint $table) {
            $table->boolean('customer_safe')->default(false)->after('completed_at');
            $table->index(['activitable_type', 'activitable_id', 'customer_safe'], 'crm_act_activitable_safe_idx');
        });

        Schema::table('crm_change_orders', function (Blueprint $table) {
            $table->string('customer_status', 30)->default('pending')->after('status');
            $table->foreignId('approved_by_portal_account_id')
                ->nullable()
                ->after('approved_by')
                ->constrained('crm_portal_accounts')
                ->nullOnDelete();
            $table->timestamp('customer_responded_at')->nullable()->after('approved_at');
        });

        Schema::table('crm_contacts', function (Blueprint $table) {
            $table->timestamp('portal_enabled_at')->nullable()->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('crm_contacts', function (Blueprint $table) {
            $table->dropColumn('portal_enabled_at');
        });

        Schema::table('crm_change_orders', function (Blueprint $table) {
            $table->dropForeign(['approved_by_portal_account_id']);
            $table->dropColumn(['customer_status', 'approved_by_portal_account_id', 'customer_responded_at']);
        });

        Schema::table('crm_activities', function (Blueprint $table) {
            $table->dropIndex('crm_act_activitable_safe_idx');
            $table->dropColumn('customer_safe');
        });

        Schema::table('crm_issues', function (Blueprint $table) {
            $table->dropColumn('is_visible_to_customer');
        });

        Schema::table('crm_project_risks', function (Blueprint $table) {
            $table->dropColumn('is_visible_to_customer');
        });
    }
};
