<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('crm_action_events')) {
            return;
        }

        Schema::create('crm_action_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->morphs('actionable');
            $table->string('rule_key', 100);
            $table->string('origin', 20)->default('rule')->comment('rule, ai');
            $table->string('status', 30)->comment('shown, acted, dismissed, rated');
            $table->boolean('helpful')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_action_events');
    }
};
