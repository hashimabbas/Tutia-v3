<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('crm_workflows', function (Blueprint $table) {
            $table->string('slug', 255)->nullable()->after('name');
        });

        DB::table('crm_workflows')->whereNull('slug')->lazyById()->each(function ($workflow) {
            $base = Str::slug($workflow->name);
            $slug = $base;
            $i = 1;
            while (DB::table('crm_workflows')->where('slug', $slug)->exists()) {
                $slug = $base.'-'.$i;
                $i++;
            }
            DB::table('crm_workflows')->where('id', $workflow->id)->update(['slug' => $slug]);
        });

        Schema::table('crm_workflows', function (Blueprint $table) {
            $table->string('slug', 255)->nullable(false)->change();
            $table->unique('slug', 'crm_wf_slug_unique');
        });
    }

    public function down(): void
    {
        Schema::table('crm_workflows', function (Blueprint $table) {
            $table->dropUnique('crm_wf_slug_unique');
            $table->dropColumn('slug');
        });
    }
};
