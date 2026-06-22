<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('crm_leads', function (Blueprint $table) {
            $table->softDeletes();
            $table->index('stage');
            $table->index('source');
            $table->index('priority');
            $table->index('assigned_to');
            $table->index('created_at');
        });

        Schema::table('crm_deals', function (Blueprint $table) {
            $table->softDeletes();
            $table->index('stage');
            $table->index('owner_id');
            $table->index('lead_id');
            $table->index('expected_close_date');
            $table->index('created_at');
        });

        Schema::table('crm_activities', function (Blueprint $table) {
            $table->softDeletes();
            $table->index('type');
            $table->index('created_by');
            $table->index('due_at');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::table('crm_leads', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropIndex(['stage']);
            $table->dropIndex(['source']);
            $table->dropIndex(['priority']);
            $table->dropIndex(['assigned_to']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('crm_deals', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropIndex(['stage']);
            $table->dropIndex(['owner_id']);
            $table->dropIndex(['lead_id']);
            $table->dropIndex(['expected_close_date']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('crm_activities', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropIndex(['type']);
            $table->dropIndex(['created_by']);
            $table->dropIndex(['due_at']);
            $table->dropIndex(['created_at']);
        });
    }
};
