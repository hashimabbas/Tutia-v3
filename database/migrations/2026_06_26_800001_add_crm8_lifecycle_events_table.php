<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_recommendation_lifecycle_events', function (Blueprint $table) {
            $table->id();
            $table->string('recommendation_type', 100);
            $table->string('status', 30);
            $table->string('target_type', 50);
            $table->unsignedBigInteger('target_id');
            $table->json('snapshot');
            $table->json('version')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('status_changed_at');
            $table->timestamps();

            $table->index(['target_type', 'target_id'], 'crm8_rec_target_idx');
            $table->index(['recommendation_type', 'status'], 'crm8_rec_type_status_idx');
            $table->index('status_changed_at', 'crm8_rec_status_changed_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_recommendation_lifecycle_events');
    }
};
