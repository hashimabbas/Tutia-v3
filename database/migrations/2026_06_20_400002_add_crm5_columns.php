<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('crm_project_risks', function (Blueprint $table) {
            if (! Schema::hasColumn('crm_project_risks', 'is_visible_to_customer')) {
                $table->boolean('is_visible_to_customer')->default(false);
            }
        });

        Schema::table('crm_issues', function (Blueprint $table) {
            if (! Schema::hasColumn('crm_issues', 'is_visible_to_customer')) {
                $table->boolean('is_visible_to_customer')->default(false);
            }
        });

        Schema::table('crm_activities', function (Blueprint $table) {
            if (! Schema::hasColumn('crm_activities', 'customer_safe')) {
                $table->boolean('customer_safe')->default(false);
            }
            if (! Schema::hasIndex('crm_activities', 'crm_act_activitable_safe_idx')) {
                $table->index(['activitable_type', 'activitable_id', 'customer_safe'], 'crm_act_activitable_safe_idx');
            }
        });

        Schema::table('crm_change_orders', function (Blueprint $table) {
            if (! Schema::hasColumn('crm_change_orders', 'customer_status')) {
                $table->string('customer_status', 30)->default('pending');
            }
            if (! Schema::hasColumn('crm_change_orders', 'approved_by_portal_account_id')) {
                $table->foreignId('approved_by_portal_account_id')
                    ->nullable()
                    ->constrained('crm_portal_accounts')
                    ->nullOnDelete();
            }
            if (! Schema::hasColumn('crm_change_orders', 'customer_responded_at')) {
                $table->timestamp('customer_responded_at')->nullable();
            }
        });

        Schema::table('crm_contacts', function (Blueprint $table) {
            if (! Schema::hasColumn('crm_contacts', 'portal_enabled_at')) {
                $table->timestamp('portal_enabled_at')->nullable();
            }
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
