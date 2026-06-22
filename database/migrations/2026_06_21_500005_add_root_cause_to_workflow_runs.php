<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('crm_workflow_runs', function (Blueprint $table) {
            $table->text('root_cause')->nullable()->after('context_snapshot');
        });
    }

    public function down(): void
    {
        Schema::table('crm_workflow_runs', function (Blueprint $table) {
            $table->dropColumn('root_cause');
        });
    }
};
