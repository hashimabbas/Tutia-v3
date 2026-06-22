<?php

use App\Services\Crm\Workflows\Catalogs\WorkflowConditionsVersion;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('crm_workflows', function (Blueprint $table) {
            $table->string('conditions_version', 10)->default(WorkflowConditionsVersion::V1->value)->after('is_active');
            $table->text('expression')->nullable()->after('conditions_version');
        });
    }

    public function down(): void
    {
        Schema::table('crm_workflows', function (Blueprint $table) {
            $table->dropColumn(['conditions_version', 'expression']);
        });
    }
};
