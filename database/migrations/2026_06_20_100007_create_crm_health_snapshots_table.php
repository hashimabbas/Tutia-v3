<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('crm_health_snapshots')) {
            return;
        }

        Schema::create('crm_health_snapshots', function (Blueprint $table) {
            $table->id();
            $table->morphs('healthable');
            $table->string('scorer', 100)->default('rule_based');
            $table->unsignedTinyInteger('score');
            $table->string('tier', 20)->comment('healthy, at_risk, critical');
            $table->json('factors');
            $table->string('trend', 20)->default('stable')->comment('improving, stable, declining');
            $table->timestamps();

            $table->index(['healthable_type', 'healthable_id', 'created_at'], 'crm_health_snap_entity_created_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_health_snapshots');
    }
};
