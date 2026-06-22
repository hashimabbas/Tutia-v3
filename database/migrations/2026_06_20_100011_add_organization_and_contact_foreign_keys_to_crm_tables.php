<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('crm_leads', 'organization_id')) {
            return;
        }

        Schema::table('crm_leads', function (Blueprint $table) {
            $table->foreignId('organization_id')->after('assigned_to')->nullable()->constrained('crm_organizations')->nullOnDelete();
            $table->index('organization_id');
        });

        Schema::table('crm_deals', function (Blueprint $table) {
            $table->foreignId('organization_id')->after('lead_id')->nullable()->constrained('crm_organizations')->nullOnDelete();
            $table->foreignId('contact_id')->after('organization_id')->nullable()->constrained('crm_contacts')->nullOnDelete();
            $table->index('organization_id');
            $table->index('contact_id');
        });
    }

    public function down(): void
    {
        Schema::table('crm_deals', function (Blueprint $table) {
            $table->dropForeign(['contact_id']);
            $table->dropForeign(['organization_id']);
            $table->dropIndex(['contact_id']);
            $table->dropIndex(['organization_id']);
            $table->dropColumn(['contact_id', 'organization_id']);
        });

        Schema::table('crm_leads', function (Blueprint $table) {
            $table->dropForeign(['organization_id']);
            $table->dropIndex(['organization_id']);
            $table->dropColumn('organization_id');
        });
    }
};
