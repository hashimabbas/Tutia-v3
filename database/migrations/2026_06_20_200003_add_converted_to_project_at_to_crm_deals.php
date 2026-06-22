<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('crm_deals', function (Blueprint $table) {
            $table->timestamp('converted_to_project_at')->nullable()->after('closed_at');
        });
    }

    public function down(): void
    {
        Schema::table('crm_deals', function (Blueprint $table) {
            $table->dropColumn('converted_to_project_at');
        });
    }
};
