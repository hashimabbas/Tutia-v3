<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('crm_approval_requests', function (Blueprint $table) {
            $table->timestamp('approved_at')->nullable()->after('completed_at');
            $table->timestamp('rejected_at')->nullable()->after('approved_at');
            $table->timestamp('first_response_at')->nullable()->after('rejected_at');
            $table->unsignedSmallInteger('resolution_time_minutes')->nullable()->after('first_response_at');
            $table->unsignedTinyInteger('escalation_count')->default(0)->after('resolution_time_minutes');
        });
    }

    public function down(): void
    {
        Schema::table('crm_approval_requests', function (Blueprint $table) {
            $table->dropColumn([
                'approved_at',
                'rejected_at',
                'first_response_at',
                'resolution_time_minutes',
                'escalation_count',
            ]);
        });
    }
};
