<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('crm_quotations', function (Blueprint $table) {
            $table->foreignId('parent_id')->nullable()->after('version')->constrained('crm_quotations')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('crm_quotations', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropColumn('parent_id');
        });
    }
};
